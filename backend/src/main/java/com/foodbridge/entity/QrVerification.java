package com.foodbridge.entity;

import com.foodbridge.entity.enums.VerificationType;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "qr_verifications", indexes = {
    @Index(name = "idx_qr_token", columnList = "token", unique = true),
    @Index(name = "idx_qr_assignment", columnList = "assignment_id"),
    @Index(name = "idx_qr_type", columnList = "verificationType")
})
public class QrVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private FoodDonation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private PickupAssignment assignment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VerificationType verificationType;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private User verifiedBy;

    public QrVerification() {
    }

    public QrVerification(FoodDonation donation, PickupAssignment assignment, VerificationType verificationType,
                          String token, Instant expiresAt) {
        this.donation = donation;
        this.assignment = assignment;
        this.verificationType = verificationType;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FoodDonation getDonation() {
        return donation;
    }

    public void setDonation(FoodDonation donation) {
        this.donation = donation;
    }

    public PickupAssignment getAssignment() {
        return assignment;
    }

    public void setAssignment(PickupAssignment assignment) {
        this.assignment = assignment;
    }

    public VerificationType getVerificationType() {
        return verificationType;
    }

    public void setVerificationType(VerificationType verificationType) {
        this.verificationType = verificationType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }
}
