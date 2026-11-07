package com.foodbridge.dto.qr;

import jakarta.validation.constraints.NotBlank;

public class QrVerificationRequest {

    @NotBlank(message = "Verification token is required")
    private String token;

    public QrVerificationRequest() {
    }

    public QrVerificationRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
