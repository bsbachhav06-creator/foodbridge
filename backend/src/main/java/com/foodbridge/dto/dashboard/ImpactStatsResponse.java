package com.foodbridge.dto.dashboard;

public class ImpactStatsResponse {

    private long totalDelivered;
    private long mealsSaved;
    private double foodSavedKg;
    private double estimatedCo2ReductionKg;
    private long activeDonors;
    private long activeNgos;
    private long activeVolunteers;

    public ImpactStatsResponse() {
    }

    public ImpactStatsResponse(long totalDelivered, long mealsSaved, double foodSavedKg,
                               double estimatedCo2ReductionKg, long activeDonors,
                               long activeNgos, long activeVolunteers) {
        this.totalDelivered = totalDelivered;
        this.mealsSaved = mealsSaved;
        this.foodSavedKg = foodSavedKg;
        this.estimatedCo2ReductionKg = estimatedCo2ReductionKg;
        this.activeDonors = activeDonors;
        this.activeNgos = activeNgos;
        this.activeVolunteers = activeVolunteers;
    }

    public long getTotalDelivered() {
        return totalDelivered;
    }

    public void setTotalDelivered(long totalDelivered) {
        this.totalDelivered = totalDelivered;
    }

    public long getMealsSaved() {
        return mealsSaved;
    }

    public void setMealsSaved(long mealsSaved) {
        this.mealsSaved = mealsSaved;
    }

    public double getFoodSavedKg() {
        return foodSavedKg;
    }

    public void setFoodSavedKg(double foodSavedKg) {
        this.foodSavedKg = foodSavedKg;
    }

    public double getEstimatedCo2ReductionKg() {
        return estimatedCo2ReductionKg;
    }

    public void setEstimatedCo2ReductionKg(double estimatedCo2ReductionKg) {
        this.estimatedCo2ReductionKg = estimatedCo2ReductionKg;
    }

    public long getActiveDonors() {
        return activeDonors;
    }

    public void setActiveDonors(long activeDonors) {
        this.activeDonors = activeDonors;
    }

    public long getActiveNgos() {
        return activeNgos;
    }

    public void setActiveNgos(long activeNgos) {
        this.activeNgos = activeNgos;
    }

    public long getActiveVolunteers() {
        return activeVolunteers;
    }

    public void setActiveVolunteers(long activeVolunteers) {
        this.activeVolunteers = activeVolunteers;
    }
}
