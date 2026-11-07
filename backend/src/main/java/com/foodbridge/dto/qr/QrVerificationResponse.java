package com.foodbridge.dto.qr;

import com.foodbridge.entity.enums.VerificationType;
import java.time.Instant;

public class QrVerificationResponse {

    private boolean verified;
    private String message;
    private Long donationId;
    private Long assignmentId;
    private VerificationType verificationType;
    private Instant verifiedAt;

    public QrVerificationResponse() {
    }

    public QrVerificationResponse(boolean verified, String message, Long donationId,
                                  Long assignmentId, VerificationType verificationType, Instant verifiedAt) {
        this.verified = verified;
        this.message = message;
        this.donationId = donationId;
        this.assignmentId = assignmentId;
        this.verificationType = verificationType;
        this.verifiedAt = verifiedAt;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getDonationId() {
        return donationId;
    }

    public void setDonationId(Long donationId) {
        this.donationId = donationId;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public VerificationType getVerificationType() {
        return verificationType;
    }

    public void setVerificationType(VerificationType verificationType) {
        this.verificationType = verificationType;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
