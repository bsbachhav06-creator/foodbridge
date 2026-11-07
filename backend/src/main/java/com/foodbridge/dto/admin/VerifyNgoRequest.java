package com.foodbridge.dto.admin;

import com.foodbridge.entity.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public class VerifyNgoRequest {

    @NotNull(message = "Verification status is required")
    private VerificationStatus verificationStatus;

    public VerifyNgoRequest() {
    }

    public VerifyNgoRequest(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}
