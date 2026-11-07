package com.foodbridge.controller;

import com.foodbridge.dto.common.ApiResponse;
import com.foodbridge.dto.qr.QrCodeResponse;
import com.foodbridge.dto.qr.QrVerificationRequest;
import com.foodbridge.dto.qr.QrVerificationResponse;
import com.foodbridge.entity.User;
import com.foodbridge.service.AuthService;
import com.foodbridge.service.QrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@Tag(name = "QR Verification", description = "Endpoints for generating and verifying pickup and delivery QR tokens")
public class QrController {

    private final QrService qrService;
    private final AuthService authService;

    public QrController(QrService qrService, AuthService authService) {
        this.qrService = qrService;
        this.authService = authService;
    }

    @GetMapping("/pickup/{assignmentId}")
    @Operation(summary = "Get pickup QR code", description = "Generates/displays single-use pickup QR code for donor to show volunteer.")
    public ResponseEntity<ApiResponse<QrCodeResponse>> getPickupQr(@PathVariable Long assignmentId) {
        User user = authService.getCurrentAuthenticatedUser();
        QrCodeResponse response = qrService.getPickupQr(assignmentId, user);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/delivery/{assignmentId}")
    @Operation(summary = "Get delivery QR code", description = "Generates/displays single-use delivery QR code for NGO to show volunteer.")
    public ResponseEntity<ApiResponse<QrCodeResponse>> getDeliveryQr(@PathVariable Long assignmentId) {
        User user = authService.getCurrentAuthenticatedUser();
        QrCodeResponse response = qrService.getDeliveryQr(assignmentId, user);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify QR code token", description = "Scanned by volunteer to confirm pickup from donor or delivery to NGO.")
    public ResponseEntity<ApiResponse<QrVerificationResponse>> verifyQr(
            @Valid @RequestBody QrVerificationRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        QrVerificationResponse response = qrService.verifyQr(request.getToken(), user);
        return ResponseEntity.ok(ApiResponse.ok("Verification successful", response));
    }
}
