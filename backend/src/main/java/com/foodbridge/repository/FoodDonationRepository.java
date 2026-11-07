package com.foodbridge.repository;

import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {

    List<FoodDonation> findByDonorIdOrderByCreatedAtDesc(Long donorId);

    List<FoodDonation> findByStatusAndExpiresAtAfterOrderByCreatedAtDesc(DonationStatus status, Instant now);

    List<FoodDonation> findByStatusAndExpiresAtBefore(DonationStatus status, Instant now);

    List<FoodDonation> findAllByOrderByCreatedAtDesc();

    long countByStatus(DonationStatus status);

    long countByFoodCategory(FoodCategory foodCategory);

    @Query("SELECT COALESCE(SUM(d.numberOfServings), 0) FROM FoodDonation d WHERE d.status = :status")
    Long sumServingsByStatus(@Param("status") DonationStatus status);

    @Query("SELECT COALESCE(SUM(d.estimatedWeightKg), 0.0) FROM FoodDonation d WHERE d.status = :status")
    Double sumWeightKgByStatus(@Param("status") DonationStatus status);

    @Query("SELECT COALESCE(SUM(d.numberOfServings), 0) FROM FoodDonation d WHERE d.donor.id = :donorId AND d.status = :status")
    Long sumServingsByDonorAndStatus(@Param("donorId") Long donorId, @Param("status") DonationStatus status);

    @Query("SELECT COALESCE(SUM(d.estimatedWeightKg), 0.0) FROM FoodDonation d WHERE d.donor.id = :donorId AND d.status = :status")
    Double sumWeightKgByDonorAndStatus(@Param("donorId") Long donorId, @Param("status") DonationStatus status);

    long countByDonorId(Long donorId);
}
