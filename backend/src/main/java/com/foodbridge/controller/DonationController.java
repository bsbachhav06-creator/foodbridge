package com.foodbridge.controller;

import com.foodbridge.dto.common.ApiResponse;
import com.foodbridge.dto.donation.CreateDonationRequest;
import com.foodbridge.dto.donation.DonationResponse;
import com.foodbridge.dto.donation.UpdateDonationRequest;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.FoodCategory;
import com.foodbridge.service.AuthService;
import com.foodbridge.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@Tag(name = "Donations", description = "Endpoints for creating, managing, and browsing food donations")
public class DonationController {

    private final DonationService donationService;
    private final AuthService authService;

    public DonationController(DonationService donationService, AuthService authService) {
        this.donationService = donationService;
        this.authService = authService;
    }

    @PostMapping
    @Operation(summary = "Create surplus food donation", description = "Allows registered donors to post available food.")
    public ResponseEntity<ApiResponse<DonationResponse>> createDonation(
            @Valid @RequestBody CreateDonationRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        DonationResponse response = donationService.createDonation(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Donation posted successfully", response));
    }

    @GetMapping
    @Operation(summary = "Browse all donations", description = "Filterable list of food donations by category, status, etc.")
    public ResponseEntity<ApiResponse<List<DonationResponse>>> getAllDonations(
            @RequestParam(required = false) FoodCategory category,
            @RequestParam(required = false) Boolean vegetarian,
            @RequestParam(required = false) DonationStatus status) {
        List<DonationResponse> list = donationService.getAllDonations(category, vegetarian, status);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Search nearby available donations", description = "Computes Haversine distance from given coordinates.")
    public ResponseEntity<ApiResponse<List<DonationResponse>>> getNearbyDonations(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "10.0") Double radiusKm) {
        List<DonationResponse> list = donationService.getNearbyDonations(latitude, longitude, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current donor's donations", description = "List of food donations created by the authenticated donor.")
    public ResponseEntity<ApiResponse<List<DonationResponse>>> getMyDonations() {
        User user = authService.getCurrentAuthenticatedUser();
        List<DonationResponse> list = donationService.getMyDonations(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donation details by ID")
    public ResponseEntity<ApiResponse<DonationResponse>> getDonationById(@PathVariable Long id) {
        DonationResponse response = donationService.getDonationById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update donation details", description = "Allows editing before donation is claimed.")
    public ResponseEntity<ApiResponse<DonationResponse>> updateDonation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDonationRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        DonationResponse response = donationService.updateDonation(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Donation updated successfully", response));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a donation", description = "Cancels an available or claimed donation.")
    public ResponseEntity<ApiResponse<DonationResponse>> cancelDonation(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        DonationResponse response = donationService.cancelDonation(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Donation cancelled successfully", response));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload donation photo", description = "Uploads a photo for the food donation.")
    public ResponseEntity<ApiResponse<DonationResponse>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        User user = authService.getCurrentAuthenticatedUser();
        DonationResponse response = donationService.uploadDonationImage(id, file, user);
        return ResponseEntity.ok(ApiResponse.ok("Image uploaded successfully", response));
    }
}
