package com.foodbridge.controller;

import com.foodbridge.dto.common.ApiResponse;
import com.foodbridge.dto.pickup.PickupResponse;
import com.foodbridge.entity.User;
import com.foodbridge.service.AuthService;
import com.foodbridge.service.PickupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickups")
@Tag(name = "Volunteer Pickups", description = "Endpoints for volunteers to view and accept food transport tasks")
public class PickupController {

    private final PickupService pickupService;
    private final AuthService authService;

    public PickupController(PickupService pickupService, AuthService authService) {
        this.pickupService = pickupService;
        this.authService = authService;
    }

    @GetMapping("/available")
    @Operation(summary = "Get available pickup tasks", description = "Lists claimed donations awaiting volunteer transport within radius.")
    public ResponseEntity<ApiResponse<List<PickupResponse>>> getAvailablePickups(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "10.0") Double radiusKm) {
        List<PickupResponse> list = pickupService.getAvailablePickups(latitude, longitude, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{claimId}/accept")
    @Operation(summary = "Accept a pickup task", description = "Volunteer accepts an active claimed donation for transport.")
    public ResponseEntity<ApiResponse<PickupResponse>> acceptPickup(@PathVariable Long claimId) {
        User user = authService.getCurrentAuthenticatedUser();
        PickupResponse response = pickupService.acceptPickup(claimId, user);
        return ResponseEntity.ok(ApiResponse.ok("Pickup task accepted successfully", response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get assigned pickup tasks", description = "Lists tasks assigned to the authenticated volunteer.")
    public ResponseEntity<ApiResponse<List<PickupResponse>>> getMyPickups() {
        User user = authService.getCurrentAuthenticatedUser();
        List<PickupResponse> list = pickupService.getMyPickups(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get pickup task details")
    public ResponseEntity<ApiResponse<PickupResponse>> getPickupById(@PathVariable Long id) {
        PickupResponse response = pickupService.getPickupById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
