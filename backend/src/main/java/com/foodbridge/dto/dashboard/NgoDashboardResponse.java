package com.foodbridge.dto.dashboard;

import com.foodbridge.dto.claim.ClaimResponse;
import java.util.List;

public class NgoDashboardResponse {

    private long totalClaims;
    private long activeClaims;
    private long receivedDonations;
    private long totalMealsReceived;
    private double totalWeightKgReceived;
    private double estimatedCo2ReductionKg;
    private List<ClaimResponse> recentClaims;

    public NgoDashboardResponse() {
    }

    public long getTotalClaims() {
        return totalClaims;
    }

    public void setTotalClaims(long totalClaims) {
        this.totalClaims = totalClaims;
    }

    public long getActiveClaims() {
        return activeClaims;
    }

    public void setActiveClaims(long activeClaims) {
        this.activeClaims = activeClaims;
    }

    public long getReceivedDonations() {
        return receivedDonations;
    }

    public void setReceivedDonations(long receivedDonations) {
        this.receivedDonations = receivedDonations;
    }

    public long getTotalMealsReceived() {
        return totalMealsReceived;
    }

    public void setTotalMealsReceived(long totalMealsReceived) {
        this.totalMealsReceived = totalMealsReceived;
    }

    public double getTotalWeightKgReceived() {
        return totalWeightKgReceived;
    }

    public void setTotalWeightKgReceived(double totalWeightKgReceived) {
        this.totalWeightKgReceived = totalWeightKgReceived;
    }

    public double getEstimatedCo2ReductionKg() {
        return estimatedCo2ReductionKg;
    }

    public void setEstimatedCo2ReductionKg(double estimatedCo2ReductionKg) {
        this.estimatedCo2ReductionKg = estimatedCo2ReductionKg;
    }

    public List<ClaimResponse> getRecentClaims() {
        return recentClaims;
    }

    public void setRecentClaims(List<ClaimResponse> recentClaims) {
        this.recentClaims = recentClaims;
    }
}
