package com.foodbridge.entity;

import com.foodbridge.entity.enums.PickupStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pickup_assignments", indexes = {
    @Index(name = "idx_pickup_volunteer", columnList = "volunteer_id"),
    @Index(name = "idx_pickup_status", columnList = "status")
})
public class PickupAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false, unique = true)
    private FoodClaim claim;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private User volunteer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PickupStatus status = PickupStatus.ACCEPTED;

    @Column(nullable = false)
    private Instant acceptedAt = Instant.now();

    private Instant pickedUpAt;

    private Instant deliveredAt;

    public PickupAssignment() {
    }

    public PickupAssignment(FoodClaim claim, User volunteer) {
        this.claim = claim;
        this.volunteer = volunteer;
        this.status = PickupStatus.ACCEPTED;
        this.acceptedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FoodClaim getClaim() {
        return claim;
    }

    public void setClaim(FoodClaim claim) {
        this.claim = claim;
    }

    public User getVolunteer() {
        return volunteer;
    }

    public void setVolunteer(User volunteer) {
        this.volunteer = volunteer;
    }

    public PickupStatus getStatus() {
        return status;
    }

    public void setStatus(PickupStatus status) {
        this.status = status;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Instant acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public Instant getPickedUpAt() {
        return pickedUpAt;
    }

    public void setPickedUpAt(Instant pickedUpAt) {
        this.pickedUpAt = pickedUpAt;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Instant deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
}
