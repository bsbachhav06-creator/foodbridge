package com.foodbridge.service;

import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.repository.FoodDonationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class ScheduledTasks {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);

    private final FoodDonationRepository donationRepository;
    private final NotificationService notificationService;

    public ScheduledTasks(FoodDonationRepository donationRepository,
                          NotificationService notificationService) {
        this.donationRepository = donationRepository;
        this.notificationService = notificationService;
    }

    /**
     * Periodically check for donations that passed their expiration time.
     * Runs every 2 minutes.
     */
    @Scheduled(fixedRate = 120000)
    @Transactional
    public void autoExpireDonations() {
        Instant now = Instant.now();
        List<FoodDonation> expiredDonations =
                donationRepository.findByStatusAndExpiresAtBefore(DonationStatus.AVAILABLE, now);

        if (!expiredDonations.isEmpty()) {
            logger.info("Found {} expired donations to mark as EXPIRED", expiredDonations.size());
            for (FoodDonation donation : expiredDonations) {
                donation.setStatus(DonationStatus.EXPIRED);
                donationRepository.save(donation);

                notificationService.createNotification(
                        donation.getDonor(),
                        "Donation Expired",
                        "Your donation '" + donation.getTitle() + "' was not claimed before its expiration time and has been marked as EXPIRED.",
                        "DONATION_EXPIRED"
                );
            }
        }
    }
}
