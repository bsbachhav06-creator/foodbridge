package com.foodbridge.controller;

import com.foodbridge.dto.admin.UserStatusUpdateRequest;
import com.foodbridge.dto.auth.UserDto;
import com.foodbridge.dto.common.ApiResponse;
import com.foodbridge.dto.dashboard.AdminAnalyticsResponse;
import com.foodbridge.entity.enums.VerificationStatus;
import com.foodbridge.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Administration endpoints for reviewing NGOs, users, and platform analytics")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Returns directory of all registered users on the platform.")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/ngos/pending")
    @Operation(summary = "Get pending NGO verifications", description = "Returns NGOs awaiting admin review.")
    public ResponseEntity<ApiResponse<List<UserDto>>> getPendingNgos() {
        List<UserDto> pending = adminService.getPendingNgos();
        return ResponseEntity.ok(ApiResponse.ok(pending));
    }

    @PostMapping("/ngos/{id}/verify")
    @Operation(summary = "Approve NGO account", description = "Grants verified status so the NGO can claim food.")
    public ResponseEntity<ApiResponse<UserDto>> verifyNgo(@PathVariable Long id) {
        UserDto user = adminService.verifyNgo(id, VerificationStatus.VERIFIED);
        return ResponseEntity.ok(ApiResponse.ok("NGO verified successfully", user));
    }

    @PostMapping("/ngos/{id}/reject")
    @Operation(summary = "Reject NGO account", description = "Rejects the NGO verification request.")
    public ResponseEntity<ApiResponse<UserDto>> rejectNgo(@PathVariable Long id) {
        UserDto user = adminService.verifyNgo(id, VerificationStatus.REJECTED);
        return ResponseEntity.ok(ApiResponse.ok("NGO verification rejected", user));
    }

    @PostMapping("/users/{id}/toggle-status")
    @Operation(summary = "Activate or deactivate a user", description = "Allows suspending malicious accounts.")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody UserStatusUpdateRequest request) {
        UserDto user = adminService.toggleUserStatus(id, request.isActive());
        return ResponseEntity.ok(ApiResponse.ok("User status updated", user));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get detailed platform analytics", description = "Returns category, city, and status breakdowns.")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAnalytics() {
        AdminAnalyticsResponse analytics = adminService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.ok(analytics));
    }
}
