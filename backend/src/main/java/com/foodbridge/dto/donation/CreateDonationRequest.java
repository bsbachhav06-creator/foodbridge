package com.foodbridge.dto.donation;

import com.foodbridge.entity.enums.FoodCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class CreateDonationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Food category is required")
    private FoodCategory foodCategory;

    private String description;

    private boolean vegetarian = true;

    private String allergenInformation;

    @NotNull(message = "Number of servings is required")
    @Min(value = 1, message = "Must have at least 1 serving")
    private Integer numberOfServings;

    @NotNull(message = "Estimated weight is required")
    @DecimalMin(value = "0.1", message = "Weight must be at least 0.1 kg")
    private Double estimatedWeightKg;

    @NotNull(message = "Preparation time is required")
    private Instant preparedAt;

    @NotNull(message = "Pickup start time is required")
    private Instant pickupStartTime;

    @NotNull(message = "Expiry time is required")
    private Instant expiresAt;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String specialInstructions;

    public CreateDonationRequest() {
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public FoodCategory getFoodCategory() {
        return foodCategory;
    }

    public void setFoodCategory(FoodCategory foodCategory) {
        this.foodCategory = foodCategory;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(boolean vegetarian) {
        this.vegetarian = vegetarian;
    }

    public String getAllergenInformation() {
        return allergenInformation;
    }

    public void setAllergenInformation(String allergenInformation) {
        this.allergenInformation = allergenInformation;
    }

    public Integer getNumberOfServings() {
        return numberOfServings;
    }

    public void setNumberOfServings(Integer numberOfServings) {
        this.numberOfServings = numberOfServings;
    }

    public Double getEstimatedWeightKg() {
        return estimatedWeightKg;
    }

    public void setEstimatedWeightKg(Double estimatedWeightKg) {
        this.estimatedWeightKg = estimatedWeightKg;
    }

    public Instant getPreparedAt() {
        return preparedAt;
    }

    public void setPreparedAt(Instant preparedAt) {
        this.preparedAt = preparedAt;
    }

    public Instant getPickupStartTime() {
        return pickupStartTime;
    }

    public void setPickupStartTime(Instant pickupStartTime) {
        this.pickupStartTime = pickupStartTime;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
}
