package com.foodbridge.repository;

import com.foodbridge.entity.OrganizationProfile;
import com.foodbridge.entity.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface OrganizationProfileRepository extends JpaRepository<OrganizationProfile, Long> {
    Optional<OrganizationProfile> findByUserId(Long userId);
    List<OrganizationProfile> findByVerificationStatus(VerificationStatus status);
}
