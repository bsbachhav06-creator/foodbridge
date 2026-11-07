package com.foodbridge.service;

import com.foodbridge.dto.claim.ClaimResponse;
import com.foodbridge.entity.FoodClaim;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.PickupAssignment;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.ClaimStatus;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.PickupStatus;
import com.foodbridge.entity.enums.Role;
import com.foodbridge.entity.enums.VerificationStatus;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final FoodClaimRepository claimRepository;
    private final FoodDonationRepository donationRepository;
    private final PickupAssignmentRepository pickupAssignmentRepository;
    private final NotificationService notificationService;

    public ClaimService(FoodClaimRepository claimRepository,
                        FoodDonationRepository donationRepository,
                        PickupAssignmentRepository pickupAssignmentRepository,
                        NotificationService notificationService) {
        this.claimRepository = claimRepository;
        this.donationRepository = donationRepository;
        this.pickupAssignmentRepository = pickupAssignmentRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ClaimResponse claimDonation(Long donationId, User ngo) {
        if (ngo.getRole() != Role.NGO && ngo.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only registered NGOs can claim food donations");
        }

        // Rule: NGO must be verified by admin
        if (ngo.getRole() == Role.NGO) {
            if (ngo.getOrganizationProfile() == null ||
                    ngo.getOrganizationProfile().getVerificationStatus() != VerificationStatus.VERIFIED) {
                throw new UnauthorizedException("Your NGO account is pending admin verification. You cannot claim donations until approved.");
            }
        }

        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + donationId));

        // Rule: Donor cannot claim their own donation
        if (donation.getDonor().getId().equals(ngo.getId())) {
            throw new BadRequestException("You cannot claim your own donation");
        }

        // Rule: A donation cannot be claimed if already claimed, delivered, expired, or cancelled
        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new InvalidStatusException("Donation is not available for claiming. Current status: " + donation.getStatus());
        }

        // Rule: Cannot claim after expiresAt
        if (donation.getExpiresAt().isBefore(Instant.now())) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            throw new InvalidStatusException("This donation has expired and can no longer be claimed");
        }

        // Update donation status to CLAIMED
        donation.setStatus(DonationStatus.CLAIMED);
        donationRepository.save(donation);

        // Create Claim
        FoodClaim claim = new FoodClaim(donation, ngo);
        FoodClaim savedClaim = claimRepository.save(claim);

        // Send notifications
        notificationService.createNotification(
                donation.getDonor(),
                "Donation Claimed!",
                "Your donation '" + donation.getTitle() + "' has been claimed by " +
                        (ngo.getOrganizationProfile() != null ? ngo.getOrganizationProfile().getOrganizationName() : ngo.getFullName()) +
                        ". Waiting for a volunteer to accept pickup.",
                "DONATION_CLAIMED"
        );

        notificationService.createNotification(
                ngo,
                "Claim Confirmed",
                "You have successfully claimed '" + donation.getTitle() + "'. A volunteer will be assigned for pickup shortly.",
                "CLAIM_CONFIRMED"
        );

        return mapToClaimResponse(savedClaim);
    }

    @Transactional
    public ClaimResponse cancelClaim(Long claimId, User user) {
        FoodClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (!claim.getNgo().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to cancel this claim");
        }

        if (claim.getStatus() == ClaimStatus.COMPLETED) {
            throw new InvalidStatusException("Cannot cancel a completed claim");
        }
        if (claim.getStatus() == ClaimStatus.CANCELLED) {
            throw new InvalidStatusException("Claim is already cancelled");
        }

        claim.setStatus(ClaimStatus.CANCELLED);
        FoodClaim savedClaim = claimRepository.save(claim);

        // Cancel pickup assignment if one was accepted
        pickupAssignmentRepository.findByClaimId(claimId).ifPresent(assignment -> {
            if (assignment.getStatus() == PickupStatus.ACCEPTED) {
                assignment.setStatus(PickupStatus.CANCELLED);
                pickupAssignmentRepository.save(assignment);

                notificationService.createNotification(
                        assignment.getVolunteer(),
                        "Pickup Task Cancelled",
                        "The NGO has cancelled claim for '" + claim.getDonation().getTitle() + "'.",
                        "PICKUP_CANCELLED"
                );
            }
        });

        // Revert donation to AVAILABLE if not expired
        FoodDonation donation = claim.getDonation();
        if (donation.getExpiresAt().isAfter(Instant.now())) {
            donation.setStatus(DonationStatus.AVAILABLE);
        } else {
            donation.setStatus(DonationStatus.EXPIRED);
        }
        donationRepository.save(donation);

        notificationService.createNotification(
                donation.getDonor(),
                "Claim Cancelled",
                "The claim on donation '" + donation.getTitle() + "' was cancelled. The donation is available again.",
                "CLAIM_CANCELLED"
        );

        return mapToClaimResponse(savedClaim);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getMyClaims(User ngo) {
        return claimRepository.findByNgoIdOrderByClaimedAtDesc(ngo.getId())
                .stream()
                .map(this::mapToClaimResponse)
                .collect(Collectors.toList());
    }

    public ClaimResponse mapToClaimResponse(FoodClaim claim) {
        ClaimResponse resp = new ClaimResponse();
        resp.setId(claim.getId());
        resp.setDonationId(claim.getDonation().getId());
        resp.setDonationTitle(claim.getDonation().getTitle());
        resp.setFoodCategory(claim.getDonation().getFoodCategory());
        resp.setNumberOfServings(claim.getDonation().getNumberOfServings());
        resp.setEstimatedWeightKg(claim.getDonation().getEstimatedWeightKg());
        resp.setPickupAddress(claim.getDonation().getPickupAddress());
        resp.setNgoId(claim.getNgo().getId());
        resp.setNgoName(claim.getNgo().getFullName());
        resp.setClaimedAt(claim.getClaimedAt());
        resp.setStatus(claim.getStatus());

        pickupAssignmentRepository.findByClaimId(claim.getId()).ifPresent(assignment -> {
            resp.setAssignmentId(assignment.getId());
            resp.setVolunteerId(assignment.getVolunteer().getId());
            resp.setVolunteerName(assignment.getVolunteer().getFullName());
            resp.setVolunteerPhone(assignment.getVolunteer().getPhone());
            resp.setAssignmentStatus(assignment.getStatus());
        });

        return resp;
    }
}
