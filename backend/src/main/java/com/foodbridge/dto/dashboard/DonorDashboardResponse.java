package com.foodbridge.dto.dashboard;

import com.foodbridge.dto.donation.DonationResponse;
import java.util.List;

public class DonorDashboardResponse {

    private long totalDonations;
    private long activeDonations;
    private long completedDonations;
    private long totalMealsDonated;
    private double totalWeightKgDonated;
    private double estimatedCo2ReductionKg;
    private List<DonationResponse> recentDonations;

    public DonorDashboardResponse() {
    }

    public long getTotalDonations() {
        return totalDonations;
    }

    public void setTotalDonations(long totalDonations) {
        this.totalDonations = totalDonations;
    }

    public long getActiveDonations() {
        return activeDonations;
    }

    public void setActiveDonations(long activeDonations) {
        this.activeDonations = activeDonations;
    }

    public long getCompletedDonations() {
        return completedDonations;
    }

    public void setCompletedDonations(long completedDonations) {
        this.completedDonations = completedDonations;
    }

    public long getTotalMealsDonated() {
        return totalMealsDonated;
    }

    public void setTotalMealsDonated(long totalMealsDonated) {
        this.totalMealsDonated = totalMealsDonated;
    }

    public double getTotalWeightKgDonated() {
        return totalWeightKgDonated;
    }

    public void setTotalWeightKgDonated(double totalWeightKgDonated) {
        this.totalWeightKgDonated = totalWeightKgDonated;
    }

    public double getEstimatedCo2ReductionKg() {
        return estimatedCo2ReductionKg;
    }

    public void setEstimatedCo2ReductionKg(double estimatedCo2ReductionKg) {
        this.estimatedCo2ReductionKg = estimatedCo2ReductionKg;
    }

    public List<DonationResponse> getRecentDonations() {
        return recentDonations;
    }

    public void setRecentDonations(List<DonationResponse> recentDonations) {
        this.recentDonations = recentDonations;
    }
}
