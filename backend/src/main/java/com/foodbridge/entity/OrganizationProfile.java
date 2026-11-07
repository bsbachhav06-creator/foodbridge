package com.foodbridge.entity;

import com.foodbridge.entity.enums.OrganizationType;
import com.foodbridge.entity.enums.VerificationStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "organization_profiles", indexes = {
    @Index(name = "idx_org_city", columnList = "city"),
    @Index(name = "idx_org_lat_lng", columnList = "latitude, longitude"),
    @Index(name = "idx_org_verification", columnList = "verificationStatus")
})
public class OrganizationProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String organizationName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrganizationType organizationType;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 100)
    private String operatingHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public OrganizationProfile() {
    }

    public OrganizationProfile(User user, String organizationName, OrganizationType organizationType,
                               String address, String city, Double latitude, Double longitude,
                               String operatingHours, VerificationStatus verificationStatus) {
        this.user = user;
        this.organizationName = organizationName;
        this.organizationType = organizationType;
        this.address = address;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.operatingHours = operatingHours;
        this.verificationStatus = verificationStatus != null ? verificationStatus : VerificationStatus.PENDING;
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public OrganizationType getOrganizationType() {
        return organizationType;
    }

    public void setOrganizationType(OrganizationType organizationType) {
        this.organizationType = organizationType;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
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

    public String getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(String operatingHours) {
        this.operatingHours = operatingHours;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
