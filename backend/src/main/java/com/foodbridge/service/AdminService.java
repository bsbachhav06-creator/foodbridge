package com.foodbridge.service;

import com.foodbridge.dto.admin.VerifyNgoRequest;
import com.foodbridge.dto.auth.UserDto;
import com.foodbridge.dto.dashboard.AdminAnalyticsResponse;
import com.foodbridge.dto.dashboard.ImpactStatsResponse;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.OrganizationProfile;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.FoodCategory;
import com.foodbridge.entity.enums.Role;
import com.foodbridge.entity.enums.VerificationStatus;
import com.foodbridge.exception.BadRequestException;
import com.foodbridge.exception.ResourceNotFoundException;
import com.foodbridge.repository.FoodDonationRepository;
import com.foodbridge.repository.OrganizationProfileRepository;
import com.foodbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final OrganizationProfileRepository organizationProfileRepository;
    private final FoodDonationRepository donationRepository;
    private final AuthService authService;
    private final DashboardService dashboardService;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository,
                        OrganizationProfileRepository organizationProfileRepository,
                        FoodDonationRepository donationRepository,
                        AuthService authService,
                        DashboardService dashboardService,
                        NotificationService notificationService) {
        this.userRepository = userRepository;
        this.organizationProfileRepository = organizationProfileRepository;
        this.donationRepository = donationRepository;
        this.authService = authService;
        this.dashboardService = dashboardService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(authService::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getPendingNgos() {
        return organizationProfileRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream()
                .filter(org -> org.getUser().getRole() == Role.NGO)
                .map(org -> authService.mapToUserDto(org.getUser()))
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto verifyNgo(Long orgId, VerificationStatus status) {
        OrganizationProfile profile = organizationProfileRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization profile not found with id: " + orgId));

        if (status == null || status == VerificationStatus.PENDING) {
            throw new BadRequestException("Verification status must be VERIFIED or REJECTED");
        }

        profile.setVerificationStatus(status);
        OrganizationProfile saved = organizationProfileRepository.save(profile);

        // Notify the NGO
        String title = status == VerificationStatus.VERIFIED ? "NGO Account Approved!" : "NGO Account Verification Rejected";
        String msg = status == VerificationStatus.VERIFIED
                ? "Your NGO account has been verified by the administrator. You can now claim surplus food donations!"
                : "Your NGO verification was rejected. Please contact administrator for assistance.";

        notificationService.createNotification(
                saved.getUser(),
                title,
                msg,
                "NGO_VERIFICATION"
        );

        return authService.mapToUserDto(saved.getUser());
    }

    @Transactional
    public UserDto toggleUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(active);
        User saved = userRepository.save(user);

        notificationService.createNotification(
                saved,
                active ? "Account Reactivated" : "Account Suspended",
                active ? "Your FoodBridge account has been reactivated." : "Your account has been suspended by an administrator.",
                "ACCOUNT_STATUS"
        );

        return authService.mapToUserDto(saved);
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getAnalytics() {
        ImpactStatsResponse impact = dashboardService.getImpactStats();
        List<FoodDonation> allDonations = donationRepository.findAll();

        // Category breakdown
        Map<String, Long> categoryBreakdown = new LinkedHashMap<>();
        for (FoodCategory cat : FoodCategory.values()) {
            categoryBreakdown.put(cat.name(), 0L);
        }
        for (FoodDonation d : allDonations) {
            categoryBreakdown.merge(d.getFoodCategory().name(), 1L, Long::sum);
        }

        // Status breakdown
        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (FoodDonation d : allDonations) {
            statusBreakdown.merge(d.getStatus().name(), 1L, Long::sum);
        }

        // City breakdown
        Map<String, Long> cityBreakdown = new LinkedHashMap<>();
        for (FoodDonation d : allDonations) {
            String city = "Mumbai";
            if (d.getDonor().getOrganizationProfile() != null && d.getDonor().getOrganizationProfile().getCity() != null) {
                city = d.getDonor().getOrganizationProfile().getCity();
            }
            cityBreakdown.merge(city, 1L, Long::sum);
        }

        // Monthly trend (group by YYYY-MM)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM").withZone(ZoneId.of("UTC"));
        Map<String, Long> monthlyTrend = new TreeMap<>();
        for (FoodDonation d : allDonations) {
            String month = formatter.format(d.getCreatedAt());
            monthlyTrend.merge(month, 1L, Long::sum);
        }

        long pendingNgoCount = organizationProfileRepository.findByVerificationStatus(VerificationStatus.PENDING).size();
        long totalUsers = userRepository.count();

        AdminAnalyticsResponse resp = new AdminAnalyticsResponse();
        resp.setImpactStats(impact);
        resp.setCategoryBreakdown(categoryBreakdown);
        resp.setStatusBreakdown(statusBreakdown);
        resp.setCityBreakdown(cityBreakdown);
        resp.setMonthlyTrend(monthlyTrend);
        resp.setPendingNgoCount(pendingNgoCount);
        resp.setTotalUsers(totalUsers);

        return resp;
    }
}
