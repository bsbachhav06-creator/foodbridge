package com.foodbridge.controller;

import com.foodbridge.dto.common.ApiResponse;
import com.foodbridge.dto.dashboard.DonorDashboardResponse;
import com.foodbridge.dto.dashboard.ImpactStatsResponse;
import com.foodbridge.dto.dashboard.NgoDashboardResponse;
import com.foodbridge.dto.dashboard.VolunteerDashboardResponse;
import com.foodbridge.entity.User;
import com.foodbridge.service.AuthService;
import com.foodbridge.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Endpoints for aggregate impact and role-specific dashboards")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    public DashboardController(DashboardService dashboardService, AuthService authService) {
        this.dashboardService = dashboardService;
        this.authService = authService;
    }

    @GetMapping("/impact")
    @Operation(summary = "Get platform-wide impact statistics", description = "Public statistics showing meals saved, kg saved, and CO2 reduction.")
    public ResponseEntity<ApiResponse<ImpactStatsResponse>> getImpactStats() {
        ImpactStatsResponse stats = dashboardService.getImpactStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/donor")
    @Operation(summary = "Get donor dashboard metrics", description = "Metrics and recent activity for the authenticated donor.")
    public ResponseEntity<ApiResponse<DonorDashboardResponse>> getDonorDashboard() {
        User user = authService.getCurrentAuthenticatedUser();
        DonorDashboardResponse response = dashboardService.getDonorDashboard(user);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/ngo")
    @Operation(summary = "Get NGO dashboard metrics", description = "Metrics and recent claims for the authenticated NGO.")
    public ResponseEntity<ApiResponse<NgoDashboardResponse>> getNgoDashboard() {
        User user = authService.getCurrentAuthenticatedUser();
        NgoDashboardResponse response = dashboardService.getNgoDashboard(user);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/volunteer")
    @Operation(summary = "Get volunteer dashboard metrics", description = "Metrics and active task for the authenticated volunteer.")
    public ResponseEntity<ApiResponse<VolunteerDashboardResponse>> getVolunteerDashboard() {
        User user = authService.getCurrentAuthenticatedUser();
        VolunteerDashboardResponse response = dashboardService.getVolunteerDashboard(user);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
