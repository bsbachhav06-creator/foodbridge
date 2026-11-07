package com.foodbridge.dto.dashboard;

import com.foodbridge.dto.pickup.PickupResponse;

public class VolunteerDashboardResponse {

    private long totalPickups;
    private long activePickups;
    private long completedDeliveries;
    private long totalMealsDelivered;
    private double totalWeightKgDelivered;
    private double estimatedCo2ReductionKg;
    private PickupResponse activeTask;

    public VolunteerDashboardResponse() {
    }

    public long getTotalPickups() {
        return totalPickups;
    }

    public void setTotalPickups(long totalPickups) {
        this.totalPickups = totalPickups;
    }

    public long getActivePickups() {
        return activePickups;
    }

    public void setActivePickups(long activePickups) {
        this.activePickups = activePickups;
    }

    public long getCompletedDeliveries() {
        return completedDeliveries;
    }

    public void setCompletedDeliveries(long completedDeliveries) {
        this.completedDeliveries = completedDeliveries;
    }

    public long getTotalMealsDelivered() {
        return totalMealsDelivered;
    }

    public void setTotalMealsDelivered(long totalMealsDelivered) {
        this.totalMealsDelivered = totalMealsDelivered;
    }

    public double getTotalWeightKgDelivered() {
        return totalWeightKgDelivered;
    }

    public void setTotalWeightKgDelivered(double totalWeightKgDelivered) {
        this.totalWeightKgDelivered = totalWeightKgDelivered;
    }

    public double getEstimatedCo2ReductionKg() {
        return estimatedCo2ReductionKg;
    }

    public void setEstimatedCo2ReductionKg(double estimatedCo2ReductionKg) {
        this.estimatedCo2ReductionKg = estimatedCo2ReductionKg;
    }

    public PickupResponse getActiveTask() {
        return activeTask;
    }

    public void setActiveTask(PickupResponse activeTask) {
        this.activeTask = activeTask;
    }
}
