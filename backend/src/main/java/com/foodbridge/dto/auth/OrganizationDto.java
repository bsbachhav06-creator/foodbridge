package com.foodbridge.dto.auth;

import com.foodbridge.entity.enums.OrganizationType;
import com.foodbridge.entity.enums.VerificationStatus;

public class OrganizationDto {
    private Long id;
    private String organizationName;
    private OrganizationType organizationType;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private String operatingHours;
    private VerificationStatus verificationStatus;

    public OrganizationDto() {
    }

    public OrganizationDto(Long id, String organizationName, OrganizationType organizationType,
                           String address, String city, Double latitude, Double longitude,
                           String operatingHours, VerificationStatus verificationStatus) {
        this.id = id;
        this.organizationName = organizationName;
        this.organizationType = organizationType;
        this.address = address;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.operatingHours = operatingHours;
        this.verificationStatus = verificationStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
