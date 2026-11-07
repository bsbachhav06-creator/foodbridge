package com.foodbridge.repository;

import com.foodbridge.entity.FoodClaim;
import com.foodbridge.entity.enums.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodClaimRepository extends JpaRepository<FoodClaim, Long> {

    List<FoodClaim> findByNgoIdOrderByClaimedAtDesc(Long ngoId);

    Optional<FoodClaim> findByDonationId(Long donationId);

    boolean existsByDonationIdAndStatus(Long donationId, ClaimStatus status);

    long countByNgoId(Long ngoId);

    @Query("SELECT COUNT(c) FROM FoodClaim c WHERE c.ngo.id = :ngoId AND c.status = :status")
    long countByNgoIdAndStatus(@Param("ngoId") Long ngoId, @Param("status") ClaimStatus status);
}
