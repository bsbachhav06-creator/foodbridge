package com.foodbridge.service;

import com.foodbridge.dto.dashboard.DonorDashboardResponse;
import com.foodbridge.dto.dashboard.ImpactStatsResponse;
import com.foodbridge.dto.dashboard.NgoDashboardResponse;
import com.foodbridge.dto.dashboard.VolunteerDashboardResponse;
import com.foodbridge.dto.pickup.PickupResponse;
import com.foodbridge.entity.FoodClaim;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.PickupAssignment;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.ClaimStatus;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.PickupStatus;
import com.foodbridge.entity.enums.Role;
import com.foodbridge.repository.FoodClaimRepository;
import com.foodbridge.repository.FoodDonationRepository;
import com.foodbridge.repository.PickupAssignmentRepository;
import com.foodbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final FoodDonationRepository donationRepository;
    private final FoodClaimRepository claimRepository;
    private final PickupAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final DonationService donationService;
    private final ClaimService claimService;
    private final PickupService pickupService;

    public DashboardService(FoodDonationRepository donationRepository,
                            FoodClaimRepository claimRepository,
                            PickupAssignmentRepository assignmentRepository,
                            UserRepository userRepository,
                            DonationService donationService,
                            ClaimService claimService,
                            PickupService pickupService) {
        this.donationRepository = donationRepository;
        this.claimRepository = claimRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.donationService = donationService;
        this.claimService = claimService;
        this.pickupService = pickupService;
    }

    @Transactional(readOnly = true)
    public ImpactStatsResponse getImpactStats() {
        long totalDelivered = donationRepository.countByStatus(DonationStatus.DELIVERED);
        Long mealsSaved = donationRepository.sumServingsByStatus(DonationStatus.DELIVERED);
        Double foodSavedKg = donationRepository.sumWeightKgByStatus(DonationStatus.DELIVERED);

        long meals = (mealsSaved != null) ? mealsSaved : 0L;
        double weightKg = (foodSavedKg != null) ? foodSavedKg : 0.0;
        double co2Reduction = Math.round(weightKg * 2.5 * 100.0) / 100.0; // Formula: foodSavedKg * 2.5

        long activeDonors = userRepository.countByRole(Role.DONOR);
        long activeNgos = userRepository.countByRole(Role.NGO);
        long activeVolunteers = userRepository.countByRole(Role.VOLUNTEER);

        return new ImpactStatsResponse(
                totalDelivered,
                meals,
                Math.round(weightKg * 100.0) / 100.0,
                co2Reduction,
                activeDonors,
                activeNgos,
                activeVolunteers
        );
    }

    @Transactional(readOnly = true)
    public DonorDashboardResponse getDonorDashboard(User donor) {
        List<FoodDonation> donations = donationRepository.findByDonorIdOrderByCreatedAtDesc(donor.getId());

        long total = donations.size();
        long active = donations.stream()
                .filter(d -> d.getStatus() == DonationStatus.AVAILABLE ||
                        d.getStatus() == DonationStatus.CLAIMED ||
                        d.getStatus() == DonationStatus.VOLUNTEER_ASSIGNED ||
                        d.getStatus() == DonationStatus.PICKED_UP)
                .count();

        long completed = donations.stream()
                .filter(d -> d.getStatus() == DonationStatus.DELIVERED)
                .count();

        Long meals = donationRepository.sumServingsByDonorAndStatus(donor.getId(), DonationStatus.DELIVERED);
        Double weight = donationRepository.sumWeightKgByDonorAndStatus(donor.getId(), DonationStatus.DELIVERED);

        long mealsCount = meals != null ? meals : 0L;
        double weightVal = weight != null ? weight : 0.0;
        double co2 = Math.round(weightVal * 2.5 * 100.0) / 100.0;

        DonorDashboardResponse resp = new DonorDashboardResponse();
        resp.setTotalDonations(total);
        resp.setActiveDonations(active);
        resp.setCompletedDonations(completed);
        resp.setTotalMealsDonated(mealsCount);
        resp.setTotalWeightKgDonated(Math.round(weightVal * 100.0) / 100.0);
        resp.setEstimatedCo2ReductionKg(co2);
        resp.setRecentDonations(
                donations.stream()
                        .limit(5)
                        .map(d -> donationService.mapToResponse(d, null))
                        .collect(Collectors.toList())
        );

        return resp;
    }

    @Transactional(readOnly = true)
    public NgoDashboardResponse getNgoDashboard(User ngo) {
        List<FoodClaim> claims = claimRepository.findByNgoIdOrderByClaimedAtDesc(ngo.getId());

        long total = claims.size();
        long active = claims.stream().filter(c -> c.getStatus() == ClaimStatus.ACTIVE).count();
        long received = claims.stream().filter(c -> c.getStatus() == ClaimStatus.COMPLETED).count();

        long meals = claims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.COMPLETED)
                .mapToLong(c -> c.getDonation().getNumberOfServings())
                .sum();

        double weight = claims.stream()
                .filter(c -> c.getStatus() == ClaimStatus.COMPLETED)
                .mapToDouble(c -> c.getDonation().getEstimatedWeightKg())
                .sum();

        double co2 = Math.round(weight * 2.5 * 100.0) / 100.0;

        NgoDashboardResponse resp = new NgoDashboardResponse();
        resp.setTotalClaims(total);
        resp.setActiveClaims(active);
        resp.setReceivedDonations(received);
        resp.setTotalMealsReceived(meals);
        resp.setTotalWeightKgReceived(Math.round(weight * 100.0) / 100.0);
        resp.setEstimatedCo2ReductionKg(co2);
        resp.setRecentClaims(
                claims.stream()
                        .limit(5)
                        .map(claimService::mapToClaimResponse)
                        .collect(Collectors.toList())
        );

        return resp;
    }

    @Transactional(readOnly = true)
    public VolunteerDashboardResponse getVolunteerDashboard(User volunteer) {
        List<PickupAssignment> assignments =
                assignmentRepository.findByVolunteerIdOrderByAcceptedAtDesc(volunteer.getId());

        long total = assignments.size();
        long active = assignments.stream()
                .filter(a -> a.getStatus() == PickupStatus.ACCEPTED || a.getStatus() == PickupStatus.PICKED_UP)
                .count();
        long completed = assignments.stream()
                .filter(a -> a.getStatus() == PickupStatus.DELIVERED)
                .count();

        long meals = assignments.stream()
                .filter(a -> a.getStatus() == PickupStatus.DELIVERED)
                .mapToLong(a -> a.getClaim().getDonation().getNumberOfServings())
                .sum();

        double weight = assignments.stream()
                .filter(a -> a.getStatus() == PickupStatus.DELIVERED)
                .mapToDouble(a -> a.getClaim().getDonation().getEstimatedWeightKg())
                .sum();

        double co2 = Math.round(weight * 2.5 * 100.0) / 100.0;

        PickupResponse activeTask = assignments.stream()
                .filter(a -> a.getStatus() == PickupStatus.ACCEPTED || a.getStatus() == PickupStatus.PICKED_UP)
                .findFirst()
                .map(a -> pickupService.mapToResponse(a, null))
                .orElse(null);

        VolunteerDashboardResponse resp = new VolunteerDashboardResponse();
        resp.setTotalPickups(total);
        resp.setActivePickups(active);
        resp.setCompletedDeliveries(completed);
        resp.setTotalMealsDelivered(meals);
        resp.setTotalWeightKgDelivered(Math.round(weight * 100.0) / 100.0);
        resp.setEstimatedCo2ReductionKg(co2);
        resp.setActiveTask(activeTask);

        return resp;
    }
}
