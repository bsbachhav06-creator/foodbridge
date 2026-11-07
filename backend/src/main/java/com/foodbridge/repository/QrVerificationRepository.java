package com.foodbridge.repository;

import com.foodbridge.entity.QrVerification;
import com.foodbridge.entity.enums.VerificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrVerificationRepository extends JpaRepository<QrVerification, Long> {

    Optional<QrVerification> findByToken(String token);

    Optional<QrVerification> findByAssignmentIdAndVerificationType(Long assignmentId, VerificationType verificationType);
}
