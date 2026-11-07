package com.foodbridge.service;

import com.foodbridge.dto.qr.QrCodeResponse;
import com.foodbridge.dto.qr.QrVerificationResponse;
import com.foodbridge.entity.FoodClaim;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.PickupAssignment;
import com.foodbridge.entity.QrVerification;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.ClaimStatus;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.PickupStatus;
import com.foodbridge.entity.enums.Role;
import com.foodbridge.entity.enums.VerificationType;
import com.foodbridge.exception.BadRequestException;
import com.foodbridge.exception.InvalidStatusException;
import com.foodbridge.exception.ResourceNotFoundException;
import com.foodbridge.exception.UnauthorizedException;
import com.foodbridge.repository.FoodClaimRepository;
import com.foodbridge.repository.FoodDonationRepository;
import com.foodbridge.repository.PickupAssignmentRepository;
import com.foodbridge.repository.QrVerificationRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
public class QrService {

    private static final Logger logger = LoggerFactory.getLogger(QrService.class);

    private final QrVerificationRepository qrRepository;
    private final PickupAssignmentRepository assignmentRepository;
    private final FoodDonationRepository donationRepository;
    private final FoodClaimRepository claimRepository;
    private final NotificationService notificationService;

    public QrService(QrVerificationRepository qrRepository,
                     PickupAssignmentRepository assignmentRepository,
                     FoodDonationRepository donationRepository,
                     FoodClaimRepository claimRepository,
                     NotificationService notificationService) {
        this.qrRepository = qrRepository;
        this.assignmentRepository = assignmentRepository;
        this.donationRepository = donationRepository;
        this.claimRepository = claimRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public QrVerification createPickupVerification(FoodDonation donation, PickupAssignment assignment) {
        String token = "PICKUP-" + UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);
        QrVerification qr = new QrVerification(donation, assignment, VerificationType.PICKUP, token, expiresAt);
        return qrRepository.save(qr);
    }

    @Transactional
    public QrVerification createDeliveryVerification(FoodDonation donation, PickupAssignment assignment) {
        String token = "DELIVERY-" + UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);
        QrVerification qr = new QrVerification(donation, assignment, VerificationType.DELIVERY, token, expiresAt);
        return qrRepository.save(qr);
    }

    @Transactional
    public QrCodeResponse getPickupQr(Long assignmentId, User user) {
        PickupAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup assignment not found with id: " + assignmentId));

        FoodDonation donation = assignment.getClaim().getDonation();

        // Only Donor or Admin can display Pickup QR
        if (!donation.getDonor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only the donor or admin can view the pickup QR code");
        }

        QrVerification qr = qrRepository.findByAssignmentIdAndVerificationType(assignmentId, VerificationType.PICKUP)
                .orElseGet(() -> createPickupVerification(donation, assignment));

        String qrImage = generateQrCodeBase64(qr.getToken(), 300, 300);

        return new QrCodeResponse(
                assignment.getId(),
                donation.getId(),
                donation.getTitle(),
                VerificationType.PICKUP,
                qr.getToken(),
                qrImage,
                qr.getExpiresAt()
        );
    }

    @Transactional
    public QrCodeResponse getDeliveryQr(Long assignmentId, User user) {
        PickupAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup assignment not found with id: " + assignmentId));

        FoodClaim claim = assignment.getClaim();
        FoodDonation donation = claim.getDonation();

        // Only NGO recipient or Admin can display Delivery QR
        if (!claim.getNgo().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only the recipient NGO or admin can view the delivery QR code");
        }

        QrVerification qr = qrRepository.findByAssignmentIdAndVerificationType(assignmentId, VerificationType.DELIVERY)
                .orElseGet(() -> createDeliveryVerification(donation, assignment));

        String qrImage = generateQrCodeBase64(qr.getToken(), 300, 300);

        return new QrCodeResponse(
                assignment.getId(),
                donation.getId(),
                donation.getTitle(),
                VerificationType.DELIVERY,
                qr.getToken(),
                qrImage,
                qr.getExpiresAt()
        );
    }

    @Transactional
    public QrVerificationResponse verifyQr(String token, User volunteer) {
        if (volunteer.getRole() != Role.VOLUNTEER && volunteer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only assigned volunteers can scan verification QR codes");
        }

        QrVerification qr = qrRepository.findByToken(token.trim())
                .orElseThrow(() -> new BadRequestException("Invalid or unrecognized QR token: " + token));

        if (qr.getVerifiedAt() != null) {
            throw new InvalidStatusException("This QR code has already been verified on " + qr.getVerifiedAt());
        }

        if (qr.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidStatusException("This verification QR token has expired");
        }

        PickupAssignment assignment = qr.getAssignment();

        // Rule: Only the assigned volunteer can verify
        if (!assignment.getVolunteer().getId().equals(volunteer.getId()) && volunteer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not the volunteer assigned to this task");
        }

        FoodDonation donation = qr.getDonation();
        FoodClaim claim = assignment.getClaim();
        Instant now = Instant.now();

        if (qr.getVerificationType() == VerificationType.PICKUP) {
            if (assignment.getStatus() != PickupStatus.ACCEPTED && assignment.getStatus() != PickupStatus.PENDING) {
                throw new InvalidStatusException("Cannot verify pickup. Current assignment status: " + assignment.getStatus());
            }

            // Update assignment to PICKED_UP
            assignment.setStatus(PickupStatus.PICKED_UP);
            assignment.setPickedUpAt(now);
            assignmentRepository.save(assignment);

            // Update donation to PICKED_UP
            donation.setStatus(DonationStatus.PICKED_UP);
            donationRepository.save(donation);

            // Mark QR verification complete
            qr.setVerifiedAt(now);
            qr.setVerifiedBy(volunteer);
            qrRepository.save(qr);

            // Ensure DELIVERY QR is prepared for the NGO
            qrRepository.findByAssignmentIdAndVerificationType(assignment.getId(), VerificationType.DELIVERY)
                    .orElseGet(() -> createDeliveryVerification(donation, assignment));

            // Send notifications
            notificationService.createNotification(
                    donation.getDonor(),
                    "Food Picked Up!",
                    "Volunteer " + volunteer.getFullName() + " has verified pickup of '" + donation.getTitle() + "'.",
                    "FOOD_PICKED_UP"
            );

            notificationService.createNotification(
                    claim.getNgo(),
                    "Food En Route",
                    "Volunteer " + volunteer.getFullName() + " has picked up '" + donation.getTitle() + "' and is en route for delivery.",
                    "FOOD_EN_ROUTE"
            );

            notificationService.createNotification(
                    volunteer,
                    "Pickup Confirmed",
                    "Pickup verified for '" + donation.getTitle() + "'. Please deliver to " + claim.getNgo().getFullName() + ".",
                    "PICKUP_CONFIRMED"
            );

            return new QrVerificationResponse(
                    true,
                    "Pickup verified successfully! Food is marked as PICKED_UP.",
                    donation.getId(),
                    assignment.getId(),
                    VerificationType.PICKUP,
                    now
            );

        } else if (qr.getVerificationType() == VerificationType.DELIVERY) {
            if (assignment.getStatus() != PickupStatus.PICKED_UP) {
                throw new InvalidStatusException("Cannot verify delivery before pickup is completed. Current status: " + assignment.getStatus());
            }

            // Update assignment to DELIVERED
            assignment.setStatus(PickupStatus.DELIVERED);
            assignment.setDeliveredAt(now);
            assignmentRepository.save(assignment);

            // Update donation to DELIVERED
            donation.setStatus(DonationStatus.DELIVERED);
            donationRepository.save(donation);

            // Update claim to COMPLETED
            claim.setStatus(ClaimStatus.COMPLETED);
            claimRepository.save(claim);

            // Mark QR verification complete
            qr.setVerifiedAt(now);
            qr.setVerifiedBy(volunteer);
            qrRepository.save(qr);

            // Send notifications
            notificationService.createNotification(
                    donation.getDonor(),
                    "Donation Delivered!",
                    "Your surplus food '" + donation.getTitle() + "' was successfully delivered to " + claim.getNgo().getFullName() + "! Thank you for saving food!",
                    "DONATION_DELIVERED"
            );

            notificationService.createNotification(
                    claim.getNgo(),
                    "Delivery Completed",
                    "Delivery of '" + donation.getTitle() + "' confirmed. Meals have been saved!",
                    "DELIVERY_CONFIRMED"
            );

            notificationService.createNotification(
                    volunteer,
                    "Delivery Complete!",
                    "Great work! Delivery for '" + donation.getTitle() + "' successfully recorded. Thank you for your service!",
                    "TASK_COMPLETED"
            );

            return new QrVerificationResponse(
                    true,
                    "Delivery verified successfully! Food is marked as DELIVERED.",
                    donation.getId(),
                    assignment.getId(),
                    VerificationType.DELIVERY,
                    now
            );
        }

        throw new BadRequestException("Unknown verification type");
    }

    public String generateQrCodeBase64(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            logger.error("Failed to generate QR code", e);
            throw new RuntimeException("Could not generate QR code image", e);
        }
    }
}
