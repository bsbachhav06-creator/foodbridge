package com.foodbridge.entity;

import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.FoodCategory;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "food_donations", indexes = {
    @Index(name = "idx_donation_status", columnList = "status"),
    @Index(name = "idx_donation_expires_at", columnList = "expiresAt"),
    @Index(name = "idx_donation_lat_lng", columnList = "latitude, longitude"),
    @Index(name = "idx_donation_donor", columnList = "donor_id")
})
public class FoodDonation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FoodCategory foodCategory;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private boolean vegetarian = true;

    @Column(length = 255)
    private String allergenInformation;

    @Column(nullable = false)
    private Integer numberOfServings;

    @Column(nullable = false)
    private Double estimatedWeightKg;

    @Column(nullable = false)
    private Instant preparedAt;

    @Column(nullable = false)
    private Instant pickupStartTime;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false, length = 255)
    private String pickupAddress;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 255)
    private String imagePath;

    @Column(length = 500)
    private String specialInstructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DonationStatus status = DonationStatus.AVAILABLE;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private FoodClaim foodClaim;

    public FoodDonation() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDonor() {
        return donor;
    }

    public void setDonor(User donor) {
        this.donor = donor;
    }

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

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public FoodClaim getFoodClaim() {
        return foodClaim;
    }

    public void setFoodClaim(FoodClaim foodClaim) {
        this.foodClaim = foodClaim;
    }
}
