package com.foodbridge.entity;

import com.foodbridge.entity.enums.ClaimStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "food_claims", indexes = {
    @Index(name = "idx_claim_ngo", columnList = "ngo_id"),
    @Index(name = "idx_claim_status", columnList = "status")
})
public class FoodClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false, unique = true)
    private FoodDonation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private User ngo;

    @Column(nullable = false, updatable = false)
    private Instant claimedAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClaimStatus status = ClaimStatus.ACTIVE;

    @OneToOne(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PickupAssignment pickupAssignment;

    public FoodClaim() {
    }

    public FoodClaim(FoodDonation donation, User ngo) {
        this.donation = donation;
        this.ngo = ngo;
        this.claimedAt = Instant.now();
        this.status = ClaimStatus.ACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        this.claimedAt = Instant.now();
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

    public User getNgo() {
        return ngo;
    }

    public void setNgo(User ngo) {
        this.ngo = ngo;
    }

    public Instant getClaimedAt() {
        return claimedAt;
    }

    public void setClaimedAt(Instant claimedAt) {
        this.claimedAt = claimedAt;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public PickupAssignment getPickupAssignment() {
        return pickupAssignment;
    }

    public void setPickupAssignment(PickupAssignment pickupAssignment) {
        this.pickupAssignment = pickupAssignment;
    }
}
