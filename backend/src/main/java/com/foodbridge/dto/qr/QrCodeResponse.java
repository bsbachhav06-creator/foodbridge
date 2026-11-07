package com.foodbridge.dto.qr;

import com.foodbridge.entity.enums.VerificationType;
import java.time.Instant;

public class QrCodeResponse {

    private Long assignmentId;
    private Long donationId;
    private String donationTitle;
    private VerificationType verificationType;
    private String token;
    private String qrCodeBase64;
    private Instant expiresAt;

    public QrCodeResponse() {
    }

    public QrCodeResponse(Long assignmentId, Long donationId, String donationTitle,
                          VerificationType verificationType, String token,
                          String qrCodeBase64, Instant expiresAt) {
        this.assignmentId = assignmentId;
        this.donationId = donationId;
        this.donationTitle = donationTitle;
        this.verificationType = verificationType;
        this.token = token;
        this.qrCodeBase64 = qrCodeBase64;
        this.expiresAt = expiresAt;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public Long getDonationId() {
        return donationId;
    }

    public void setDonationId(Long donationId) {
        this.donationId = donationId;
    }

    public String getDonationTitle() {
        return donationTitle;
    }

    public void setDonationTitle(String donationTitle) {
        this.donationTitle = donationTitle;
    }

    public VerificationType getVerificationType() {
        return verificationType;
    }

    public void setVerificationType(VerificationType verificationType) {
        this.verificationType = verificationType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getQrCodeBase64() {
        return qrCodeBase64;
    }

    public void setQrCodeBase64(String qrCodeBase64) {
        this.qrCodeBase64 = qrCodeBase64;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}
