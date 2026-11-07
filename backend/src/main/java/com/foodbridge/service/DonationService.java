package com.foodbridge.service;

import com.foodbridge.dto.donation.CreateDonationRequest;
import com.foodbridge.dto.donation.DonationResponse;
import com.foodbridge.dto.donation.UpdateDonationRequest;
import com.foodbridge.entity.FoodClaim;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.PickupAssignment;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.ClaimStatus;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.FoodCategory;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final FoodDonationRepository donationRepository;
    private final FoodClaimRepository claimRepository;
    private final PickupAssignmentRepository pickupAssignmentRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public DonationService(FoodDonationRepository donationRepository,
                           FoodClaimRepository claimRepository,
                           PickupAssignmentRepository pickupAssignmentRepository,
                           FileStorageService fileStorageService,
                           NotificationService notificationService) {
        this.donationRepository = donationRepository;
        this.claimRepository = claimRepository;
        this.pickupAssignmentRepository = pickupAssignmentRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Transactional
    public DonationResponse createDonation(CreateDonationRequest request, User donor) {
        if (donor.getRole() != Role.DONOR && donor.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only donors can create food donations");
        }

        Instant now = Instant.now();
        if (request.getExpiresAt().isBefore(now)) {
            throw new BadRequestException("Expiry time must be in the future");
        }
        if (request.getPickupStartTime().isAfter(request.getExpiresAt())) {
            throw new BadRequestException("Pickup start time cannot be after expiry time");
        }

        FoodDonation donation = new FoodDonation();
        donation.setDonor(donor);
        donation.setTitle(request.getTitle().trim());
        donation.setFoodCategory(request.getFoodCategory());
        donation.setDescription(request.getDescription());
        donation.setVegetarian(request.isVegetarian());
        donation.setAllergenInformation(request.getAllergenInformation());
        donation.setNumberOfServings(request.getNumberOfServings());
        donation.setEstimatedWeightKg(request.getEstimatedWeightKg());
        donation.setPreparedAt(request.getPreparedAt());
        donation.setPickupStartTime(request.getPickupStartTime());
        donation.setExpiresAt(request.getExpiresAt());
        donation.setPickupAddress(request.getPickupAddress().trim());
        donation.setLatitude(request.getLatitude());
        donation.setLongitude(request.getLongitude());
        donation.setSpecialInstructions(request.getSpecialInstructions());
        donation.setStatus(DonationStatus.AVAILABLE);

        FoodDonation saved = donationRepository.save(donation);

        notificationService.createNotification(
                donor,
                "Donation Posted Successfully",
                "Your donation '" + saved.getTitle() + "' is now live for nearby NGOs to claim.",
                "DONATION_POSTED"
        );

        return mapToResponse(saved, null);
    }

    @Transactional
    public DonationResponse updateDonation(Long id, UpdateDonationRequest request, User user) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));

        if (!donation.getDonor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to update this donation");
        }

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new InvalidStatusException("Cannot update donation once claimed or processed. Current status: " + donation.getStatus());
        }

        donation.setTitle(request.getTitle().trim());
        donation.setFoodCategory(request.getFoodCategory());
        donation.setDescription(request.getDescription());
        donation.setVegetarian(request.isVegetarian());
        donation.setAllergenInformation(request.getAllergenInformation());
        donation.setNumberOfServings(request.getNumberOfServings());
        donation.setEstimatedWeightKg(request.getEstimatedWeightKg());
        donation.setPreparedAt(request.getPreparedAt());
        donation.setPickupStartTime(request.getPickupStartTime());
        donation.setExpiresAt(request.getExpiresAt());
        donation.setPickupAddress(request.getPickupAddress().trim());
        donation.setLatitude(request.getLatitude());
        donation.setLongitude(request.getLongitude());
        donation.setSpecialInstructions(request.getSpecialInstructions());

        FoodDonation updated = donationRepository.save(donation);
        return mapToResponse(updated, null);
    }

    @Transactional
    public DonationResponse cancelDonation(Long id, User user) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));

        if (!donation.getDonor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to cancel this donation");
        }

        if (donation.getStatus() == DonationStatus.DELIVERED) {
            throw new InvalidStatusException("Cannot cancel a donation that has already been delivered");
        }
        if (donation.getStatus() == DonationStatus.CANCELLED) {
            throw new InvalidStatusException("Donation is already cancelled");
        }

        donation.setStatus(DonationStatus.CANCELLED);
        FoodDonation saved = donationRepository.save(donation);

        // Cancel associated claim if any
        claimRepository.findByDonationId(id).ifPresent(claim -> {
            claim.setStatus(ClaimStatus.CANCELLED);
            claimRepository.save(claim);

            notificationService.createNotification(
                    claim.getNgo(),
                    "Claimed Donation Cancelled",
                    "The donor has cancelled donation '" + donation.getTitle() + "'.",
                    "DONATION_CANCELLED"
            );

            // Cancel associated pickup assignment if any
            pickupAssignmentRepository.findByClaimId(claim.getId()).ifPresent(assignment -> {
                assignment.setStatus(PickupStatus.CANCELLED);
                pickupAssignmentRepository.save(assignment);

                notificationService.createNotification(
                        assignment.getVolunteer(),
                        "Pickup Task Cancelled",
                        "The pickup task for donation '" + donation.getTitle() + "' was cancelled.",
                        "PICKUP_CANCELLED"
                );
            });
        });

        return mapToResponse(saved, null);
    }

    @Transactional
    public DonationResponse uploadDonationImage(Long id, MultipartFile file, User user) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));

        if (!donation.getDonor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to upload an image for this donation");
        }

        String imagePath = fileStorageService.storeFile(file);
        donation.setImagePath(imagePath);
        FoodDonation saved = donationRepository.save(donation);
        return mapToResponse(saved, null);
    }

    @Transactional(readOnly = true)
    public DonationResponse getDonationById(Long id) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
        return mapToResponse(donation, null);
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getMyDonations(User donor) {
        return donationRepository.findByDonorIdOrderByCreatedAtDesc(donor.getId())
                .stream()
                .map(d -> mapToResponse(d, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getAllDonations(FoodCategory category, Boolean vegetarian, DonationStatus status) {
        List<FoodDonation> list = donationRepository.findAllByOrderByCreatedAtDesc();
        return list.stream()
                .filter(d -> category == null || d.getFoodCategory() == category)
                .filter(d -> vegetarian == null || d.isVegetarian() == vegetarian)
                .filter(d -> status == null || d.getStatus() == status)
                .map(d -> mapToResponse(d, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getNearbyDonations(Double userLat, Double userLng, Double radiusKm) {
        double maxRadius = (radiusKm != null && radiusKm > 0) ? radiusKm : 10.0;
        Instant now = Instant.now();

        List<FoodDonation> availableDonations =
                donationRepository.findByStatusAndExpiresAtAfterOrderByCreatedAtDesc(DonationStatus.AVAILABLE, now);

        if (userLat == null || userLng == null) {
            return availableDonations.stream()
                    .map(d -> mapToResponse(d, null))
                    .collect(Collectors.toList());
        }

        return availableDonations.stream()
                .map(d -> {
                    double distance = calculateHaversineDistance(userLat, userLng, d.getLatitude(), d.getLongitude());
                    return new DistanceWrapper(d, distance);
                })
                .filter(w -> w.distance <= maxRadius)
                .sorted(Comparator.comparingDouble(w -> w.distance))
                .map(w -> mapToResponse(w.donation, w.distance))
                .collect(Collectors.toList());
    }

    public static double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS_KM * c;
        return Math.round(distance * 100.0) / 100.0; // round to 2 decimals
    }

    public DonationResponse mapToResponse(FoodDonation d, Double distanceKm) {
        DonationResponse resp = new DonationResponse();
        resp.setId(d.getId());
        resp.setDonorId(d.getDonor().getId());
        resp.setDonorName(d.getDonor().getFullName());
        resp.setDonorPhone(d.getDonor().getPhone());
        if (d.getDonor().getOrganizationProfile() != null) {
            resp.setDonorOrganizationName(d.getDonor().getOrganizationProfile().getOrganizationName());
        }
        resp.setTitle(d.getTitle());
        resp.setFoodCategory(d.getFoodCategory());
        resp.setDescription(d.getDescription());
        resp.setVegetarian(d.isVegetarian());
        resp.setAllergenInformation(d.getAllergenInformation());
        resp.setNumberOfServings(d.getNumberOfServings());
        resp.setEstimatedWeightKg(d.getEstimatedWeightKg());
        resp.setPreparedAt(d.getPreparedAt());
        resp.setPickupStartTime(d.getPickupStartTime());
        resp.setExpiresAt(d.getExpiresAt());
        resp.setPickupAddress(d.getPickupAddress());
        resp.setLatitude(d.getLatitude());
        resp.setLongitude(d.getLongitude());
        resp.setImagePath(d.getImagePath());
        resp.setSpecialInstructions(d.getSpecialInstructions());
        resp.setStatus(d.getStatus());
        resp.setCreatedAt(d.getCreatedAt());
        resp.setUpdatedAt(d.getUpdatedAt());
        resp.setDistanceKm(distanceKm);

        // Populate claim & volunteer if present
        claimRepository.findByDonationId(d.getId()).ifPresent(claim -> {
            resp.setClaimId(claim.getId());
            resp.setNgoId(claim.getNgo().getId());
            resp.setNgoName(claim.getNgo().getFullName());
            resp.setNgoPhone(claim.getNgo().getPhone());

            pickupAssignmentRepository.findByClaimId(claim.getId()).ifPresent(assignment -> {
                resp.setAssignmentId(assignment.getId());
                resp.setVolunteerId(assignment.getVolunteer().getId());
                resp.setVolunteerName(assignment.getVolunteer().getFullName());
                resp.setVolunteerPhone(assignment.getVolunteer().getPhone());
            });
        });

        return resp;
    }

    private static class DistanceWrapper {
        final FoodDonation donation;
        final double distance;

        DistanceWrapper(FoodDonation donation, double distance) {
            this.donation = donation;
            this.distance = distance;
        }
    }
}
