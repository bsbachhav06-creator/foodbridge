package com.foodbridge.controller;

import com.foodbridge.dto.claim.ClaimResponse;
import com.foodbridge.dto.common.ApiResponse;
import com.foodbridge.entity.User;
import com.foodbridge.service.AuthService;
import com.foodbridge.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Claims", description = "Endpoints for NGOs to claim and manage food donations")
public class ClaimController {

    private final ClaimService claimService;
    private final AuthService authService;

    public ClaimController(ClaimService claimService, AuthService authService) {
        this.claimService = claimService;
        this.authService = authService;
    }

    @PostMapping("/donations/{id}/claim")
    @Operation(summary = "Claim an available donation", description = "Allows a verified NGO to claim surplus food.")
    public ResponseEntity<ApiResponse<ClaimResponse>> claimDonation(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        ClaimResponse response = claimService.claimDonation(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Donation claimed successfully", response));
    }

    @GetMapping("/claims/my")
    @Operation(summary = "Get NGO claims", description = "Returns active and past claims made by the authenticated NGO.")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getMyClaims() {
        User user = authService.getCurrentAuthenticatedUser();
        List<ClaimResponse> list = claimService.getMyClaims(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/claims/{id}/cancel")
    @Operation(summary = "Cancel a claim", description = "Cancels an active claim and restores donation availability.")
    public ResponseEntity<ApiResponse<ClaimResponse>> cancelClaim(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        ClaimResponse response = claimService.cancelClaim(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Claim cancelled successfully", response));
    }
}
