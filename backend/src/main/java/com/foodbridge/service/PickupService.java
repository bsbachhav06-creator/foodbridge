package com.foodbridge.service;

import com.foodbridge.dto.pickup.PickupResponse;
import com.foodbridge.entity.FoodClaim;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.PickupAssignment;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.ClaimStatus;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.PickupStatus;
import com.foodbridge.entity.enums.Role;
import com.foodbridge.exception.BadRequestException;
import com.foodbridge.exception.InvalidStatusException;
import com.foodbridge.exception.ResourceNotFoundException;
import com.foodbridge.exception.UnauthorizedException;
import com.foodbridge.repository.FoodClaimRepository;
import com.foodbridge.repository.FoodDonationRepository;
import com.foodbridge.repository.PickupAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PickupService {

    private final PickupAssignmentRepository assignmentRepository;
    private final FoodClaimRepository claimRepository;
    private final FoodDonationRepository donationRepository;
    private final QrService qrService;
    private final NotificationService notificationService;

    public PickupService(PickupAssignmentRepository assignmentRepository,
                         FoodClaimRepository claimRepository,
                         FoodDonationRepository donationRepository,
                         QrService qrService,
                         NotificationService notificationService) {
        this.assignmentRepository = assignmentRepository;
        this.claimRepository = claimRepository;
        this.donationRepository = donationRepository;
        this.qrService = qrService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<PickupResponse> getAvailablePickups(Double userLat, Double userLng, Double radiusKm) {
        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 10.0;
        Instant now = Instant.now();

        List<FoodClaim> activeClaims = claimRepository.findAll().stream()
                .filter(c -> c.getStatus() == ClaimStatus.ACTIVE)
                .filter(c -> c.getDonation().getStatus() == DonationStatus.CLAIMED)
                .filter(c -> c.getDonation().getExpiresAt().isAfter(now))
                .filter(c -> {
                    Optional<PickupAssignment> assignment = assignmentRepository.findByClaimId(c.getId());
                    return assignment.isEmpty() || assignment.get().getStatus() == PickupStatus.CANCELLED;
                })
                .collect(Collectors.toList());

        return activeClaims.stream()
                .map(c -> {
                    Double dist = null;
                    if (userLat != null && userLng != null) {
                        dist = DonationService.calculateHaversineDistance(
                                userLat, userLng,
                                c.getDonation().getLatitude(), c.getDonation().getLongitude()
                        );
                    }
                    return new DistanceWrapper(c, dist);
                })
                .filter(w -> w.distance == null || w.distance <= maxRadius)
                .sorted((a, b) -> {
                    if (a.distance == null || b.distance == null) return 0;
                    return Double.compare(a.distance, b.distance);
                })
                .map(w -> mapClaimToAvailablePickupResponse(w.claim, w.distance))
                .collect(Collectors.toList());
    }

    @Transactional
    public PickupResponse acceptPickup(Long claimId, User volunteer) {
        if (volunteer.getRole() != Role.VOLUNTEER && volunteer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only registered volunteers can accept pickup tasks");
        }

        // Rule: A volunteer can accept only one active pickup task at a time
        boolean hasActiveTask = assignmentRepository.existsByVolunteerIdAndStatusIn(
                volunteer.getId(),
                Arrays.asList(PickupStatus.ACCEPTED, PickupStatus.PICKED_UP)
        );
        if (hasActiveTask) {
            throw new BadRequestException("You already have an active pickup task in progress. Please complete or cancel it before accepting another.");
        }

        FoodClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (claim.getStatus() != ClaimStatus.ACTIVE) {
            throw new InvalidStatusException("Cannot accept pickup for inactive claim. Status: " + claim.getStatus());
        }

        FoodDonation donation = claim.getDonation();
        if (donation.getStatus() != DonationStatus.CLAIMED) {
            throw new InvalidStatusException("Donation is not available for pickup assignment. Status: " + donation.getStatus());
        }

        if (donation.getExpiresAt().isBefore(Instant.now())) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            throw new InvalidStatusException("This donation has expired and cannot be picked up.");
        }

        // Create or update assignment
        PickupAssignment assignment = assignmentRepository.findByClaimId(claimId)
                .orElse(new PickupAssignment());
        assignment.setClaim(claim);
        assignment.setVolunteer(volunteer);
        assignment.setStatus(PickupStatus.ACCEPTED);
        assignment.setAcceptedAt(Instant.now());
        PickupAssignment savedAssignment = assignmentRepository.save(assignment);

        // Update donation status to VOLUNTEER_ASSIGNED
        donation.setStatus(DonationStatus.VOLUNTEER_ASSIGNED);
        donationRepository.save(donation);

        // Generate PICKUP QR code token for donor
        qrService.createPickupVerification(donation, savedAssignment);

        // Notifications
        notificationService.createNotification(
                donation.getDonor(),
                "Volunteer Assigned!",
                "Volunteer " + volunteer.getFullName() + " has accepted to pick up '" + donation.getTitle() + "'. Please prepare the pickup QR code.",
                "VOLUNTEER_ASSIGNED"
        );

        notificationService.createNotification(
                claim.getNgo(),
                "Pickup Task Accepted",
                "Volunteer " + volunteer.getFullName() + " is assigned to transport '" + donation.getTitle() + "' to your center.",
                "VOLUNTEER_ASSIGNED"
        );

        notificationService.createNotification(
                volunteer,
                "Task Accepted",
                "You have accepted pickup for '" + donation.getTitle() + "'. Head to donor location to scan the pickup QR code.",
                "TASK_ACCEPTED"
        );

        return mapToResponse(savedAssignment, null);
    }

    @Transactional(readOnly = true)
    public List<PickupResponse> getMyPickups(User volunteer) {
        return assignmentRepository.findByVolunteerIdOrderByAcceptedAtDesc(volunteer.getId())
                .stream()
                .map(a -> mapToResponse(a, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PickupResponse getPickupById(Long id) {
        PickupAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup assignment not found with id: " + id));
        return mapToResponse(assignment, null);
    }

    public PickupResponse mapToResponse(PickupAssignment a, Double distanceKm) {
        PickupResponse resp = new PickupResponse();
        resp.setId(a.getId());
        resp.setClaimId(a.getClaim().getId());
        resp.setDonationId(a.getClaim().getDonation().getId());
        resp.setDonationTitle(a.getClaim().getDonation().getTitle());
        resp.setFoodCategory(a.getClaim().getDonation().getFoodCategory());
        resp.setNumberOfServings(a.getClaim().getDonation().getNumberOfServings());
        resp.setEstimatedWeightKg(a.getClaim().getDonation().getEstimatedWeightKg());

        FoodDonation d = a.getClaim().getDonation();
        resp.setDonorName(d.getDonor().getFullName());
        resp.setDonorPhone(d.getDonor().getPhone());
        resp.setPickupAddress(d.getPickupAddress());
        resp.setPickupLatitude(d.getLatitude());
        resp.setPickupLongitude(d.getLongitude());

        User ngo = a.getClaim().getNgo();
        resp.setNgoName(ngo.getOrganizationProfile() != null ? ngo.getOrganizationProfile().getOrganizationName() : ngo.getFullName());
        resp.setNgoPhone(ngo.getPhone());
        if (ngo.getOrganizationProfile() != null) {
            resp.setDeliveryAddress(ngo.getOrganizationProfile().getAddress());
            resp.setDeliveryLatitude(ngo.getOrganizationProfile().getLatitude());
            resp.setDeliveryLongitude(ngo.getOrganizationProfile().getLongitude());
        }

        resp.setVolunteerId(a.getVolunteer().getId());
        resp.setVolunteerName(a.getVolunteer().getFullName());
        resp.setStatus(a.getStatus());
        resp.setAcceptedAt(a.getAcceptedAt());
        resp.setPickedUpAt(a.getPickedUpAt());
        resp.setDeliveredAt(a.getDeliveredAt());
        resp.setDistanceKm(distanceKm);

        return resp;
    }

    private PickupResponse mapClaimToAvailablePickupResponse(FoodClaim c, Double distanceKm) {
        PickupResponse resp = new PickupResponse();
        resp.setClaimId(c.getId());
        resp.setDonationId(c.getDonation().getId());
        resp.setDonationTitle(c.getDonation().getTitle());
        resp.setFoodCategory(c.getDonation().getFoodCategory());
        resp.setNumberOfServings(c.getDonation().getNumberOfServings());
        resp.setEstimatedWeightKg(c.getDonation().getEstimatedWeightKg());

        FoodDonation d = c.getDonation();
        resp.setDonorName(d.getDonor().getFullName());
        resp.setDonorPhone(d.getDonor().getPhone());
        resp.setPickupAddress(d.getPickupAddress());
        resp.setPickupLatitude(d.getLatitude());
        resp.setPickupLongitude(d.getLongitude());

        User ngo = c.getNgo();
        resp.setNgoName(ngo.getOrganizationProfile() != null ? ngo.getOrganizationProfile().getOrganizationName() : ngo.getFullName());
        resp.setNgoPhone(ngo.getPhone());
        if (ngo.getOrganizationProfile() != null) {
            resp.setDeliveryAddress(ngo.getOrganizationProfile().getAddress());
            resp.setDeliveryLatitude(ngo.getOrganizationProfile().getLatitude());
            resp.setDeliveryLongitude(ngo.getOrganizationProfile().getLongitude());
        }

        resp.setStatus(PickupStatus.PENDING);
        resp.setDistanceKm(distanceKm);
        return resp;
    }

    private static class DistanceWrapper {
        final FoodClaim claim;
        final Double distance;

        DistanceWrapper(FoodClaim claim, Double distance) {
            this.claim = claim;
            this.distance = distance;
        }
    }
}
