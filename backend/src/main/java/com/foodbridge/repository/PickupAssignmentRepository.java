package com.foodbridge.repository;

import com.foodbridge.entity.PickupAssignment;
import com.foodbridge.entity.enums.PickupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PickupAssignmentRepository extends JpaRepository<PickupAssignment, Long> {

    List<PickupAssignment> findByVolunteerIdOrderByAcceptedAtDesc(Long volunteerId);

    Optional<PickupAssignment> findByClaimId(Long claimId);

    List<PickupAssignment> findByVolunteerIdAndStatusIn(Long volunteerId, List<PickupStatus> statuses);

    boolean existsByVolunteerIdAndStatusIn(Long volunteerId, List<PickupStatus> statuses);

    long countByVolunteerIdAndStatus(Long volunteerId, PickupStatus status);

    @Query("SELECT p FROM PickupAssignment p WHERE p.claim.donation.id = :donationId")
    Optional<PickupAssignment> findByDonationId(@Param("donationId") Long donationId);
}
