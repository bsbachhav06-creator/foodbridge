package com.foodbridge.config;

import com.foodbridge.entity.*;
import com.foodbridge.entity.enums.*;
import com.foodbridge.repository.*;
import com.foodbridge.service.QrService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final OrganizationProfileRepository organizationProfileRepository;
    private final FoodDonationRepository donationRepository;
    private final FoodClaimRepository claimRepository;
    private final PickupAssignmentRepository assignmentRepository;
    private final QrVerificationRepository qrRepository;
    private final PasswordEncoder passwordEncoder;
    private final QrService qrService;

    public DataInitializer(UserRepository userRepository,
                           OrganizationProfileRepository organizationProfileRepository,
                           FoodDonationRepository donationRepository,
                           FoodClaimRepository claimRepository,
                           PickupAssignmentRepository assignmentRepository,
                           QrVerificationRepository qrRepository,
                           PasswordEncoder passwordEncoder,
                           QrService qrService) {
        this.userRepository = userRepository;
        this.organizationProfileRepository = organizationProfileRepository;
        this.donationRepository = donationRepository;
        this.claimRepository = claimRepository;
        this.assignmentRepository = assignmentRepository;
        this.qrRepository = qrRepository;
        this.passwordEncoder = passwordEncoder;
        this.qrService = qrService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial data load.");
            return;
        }

        logger.info("Seeding FoodBridge sample data (Development & Demo only)...");

        // 1. Admin Account
        User admin = new User();
        admin.setFullName("Platform Administrator");
        admin.setEmail("admin@foodbridge.local");
        admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        admin.setPhone("+91 98200 11223");
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        // 2. Donor Account (GreenPlate Bistro)
        User donor = new User();
        donor.setFullName("Rahul Sharma (GreenPlate)");
        donor.setEmail("donor@foodbridge.local");
        donor.setPasswordHash(passwordEncoder.encode("Donor@123"));
        donor.setPhone("+91 98200 22334");
        donor.setRole(Role.DONOR);
        donor.setActive(true);
        User savedDonor = userRepository.save(donor);

        OrganizationProfile donorProfile = new OrganizationProfile(
                savedDonor,
                "GreenPlate Bistro",
                OrganizationType.RESTAURANT,
                "12 Marine Drive, Nariman Point",
                "Mumbai",
                18.9256,
                72.8242,
                "10:00 AM - 11:30 PM",
                VerificationStatus.VERIFIED
        );
        organizationProfileRepository.save(donorProfile);
        savedDonor.setOrganizationProfile(donorProfile);

        // 3. Verified NGO (Hope Food Bank)
        User ngo = new User();
        ngo.setFullName("Priya Patel (Hope Food Bank)");
        ngo.setEmail("ngo@foodbridge.local");
        ngo.setPasswordHash(passwordEncoder.encode("Ngo@123"));
        ngo.setPhone("+91 98200 33445");
        ngo.setRole(Role.NGO);
        ngo.setActive(true);
        User savedNgo = userRepository.save(ngo);

        OrganizationProfile ngoProfile = new OrganizationProfile(
                savedNgo,
                "Hope Food Relief Trust",
                OrganizationType.NGO,
                "45 Dadar West, Near Railway Station",
                "Mumbai",
                19.0178,
                72.8478,
                "08:00 AM - 08:00 PM",
                VerificationStatus.VERIFIED
        );
        organizationProfileRepository.save(ngoProfile);
        savedNgo.setOrganizationProfile(ngoProfile);

        // 4. Unverified NGO (Youth Relief Trust - for testing admin verification)
        User unverifiedNgo = new User();
        unverifiedNgo.setFullName("Vikram Mehta (Youth Relief)");
        unverifiedNgo.setEmail("unverified-ngo@foodbridge.local");
        unverifiedNgo.setPasswordHash(passwordEncoder.encode("Ngo@123"));
        unverifiedNgo.setPhone("+91 98200 44556");
        unverifiedNgo.setRole(Role.NGO);
        unverifiedNgo.setActive(true);
        User savedUnverifiedNgo = userRepository.save(unverifiedNgo);

        OrganizationProfile unverifiedProfile = new OrganizationProfile(
                savedUnverifiedNgo,
                "Youth Relief Network",
                OrganizationType.NGO,
                "78 Andheri East, MIDC Area",
                "Mumbai",
                19.1136,
                72.8697,
                "09:00 AM - 06:00 PM",
                VerificationStatus.PENDING
        );
        organizationProfileRepository.save(unverifiedProfile);
        savedUnverifiedNgo.setOrganizationProfile(unverifiedProfile);

        // 5. Volunteer Account (Alex Johnson)
        User volunteer = new User();
        volunteer.setFullName("Alex Johnson");
        volunteer.setEmail("volunteer@foodbridge.local");
        volunteer.setPasswordHash(passwordEncoder.encode("Volunteer@123"));
        volunteer.setPhone("+91 98200 55667");
        volunteer.setRole(Role.VOLUNTEER);
        volunteer.setActive(true);
        User savedVolunteer = userRepository.save(volunteer);

        Instant now = Instant.now();

        // 6. Sample Donations
        // Donation A: AVAILABLE (Fresh Vegetable Biryani)
        FoodDonation d1 = new FoodDonation();
        d1.setDonor(savedDonor);
        d1.setTitle("Vegetable Biryani & Mirchi Ka Salan");
        d1.setFoodCategory(FoodCategory.COOKED_FOOD);
        d1.setDescription("Freshly cooked aromatic vegetable dum biryani packed in hygienic commercial food-grade containers. Cooked for a banquet with surplus remaining.");
        d1.setVegetarian(true);
        d1.setAllergenInformation("Contains dairy (ghee), nuts (cashews)");
        d1.setNumberOfServings(45);
        d1.setEstimatedWeightKg(16.5);
        d1.setPreparedAt(now.minus(2, ChronoUnit.HOURS));
        d1.setPickupStartTime(now.minus(1, ChronoUnit.HOURS));
        d1.setExpiresAt(now.plus(6, ChronoUnit.HOURS));
        d1.setPickupAddress("12 Marine Drive, Nariman Point, Mumbai");
        d1.setLatitude(18.9256);
        d1.setLongitude(72.8242);
        d1.setSpecialInstructions("Collect from the service kitchen bay behind the restaurant.");
        d1.setStatus(DonationStatus.AVAILABLE);
        donationRepository.save(d1);

        // Donation B: AVAILABLE (Artisan Sourdough and Multigrain Breads)
        FoodDonation d2 = new FoodDonation();
        d2.setDonor(savedDonor);
        d2.setTitle("Assorted Artisan Bakery Breads & Buns");
        d2.setFoodCategory(FoodCategory.BAKERY);
        d2.setDescription("Freshly baked artisanal whole-wheat loaves, burger buns, and baguettes. Baked this morning.");
        d2.setVegetarian(true);
        d2.setAllergenInformation("Contains gluten, sesame");
        d2.setNumberOfServings(70);
        d2.setEstimatedWeightKg(14.0);
        d2.setPreparedAt(now.minus(4, ChronoUnit.HOURS));
        d2.setPickupStartTime(now.minus(2, ChronoUnit.HOURS));
        d2.setExpiresAt(now.plus(18, ChronoUnit.HOURS));
        d2.setPickupAddress("12 Marine Drive, Nariman Point, Mumbai");
        d2.setLatitude(18.9280);
        d2.setLongitude(72.8260);
        d2.setSpecialInstructions("Keep in dry storage containers during transit.");
        d2.setStatus(DonationStatus.AVAILABLE);
        donationRepository.save(d2);

        // Donation C: CLAIMED by Hope Food Bank (Packaged Grains & Pulses)
        FoodDonation d3 = new FoodDonation();
        d3.setDonor(savedDonor);
        d3.setTitle("Packaged Basmati Rice & Toor Dal");
        d3.setFoodCategory(FoodCategory.PACKAGED_FOOD);
        d3.setDescription("Sealed institutional bags of long-grain basmati rice and unpolished toor dal.");
        d3.setVegetarian(true);
        d3.setAllergenInformation("None");
        d3.setNumberOfServings(120);
        d3.setEstimatedWeightKg(40.0);
        d3.setPreparedAt(now.minus(10, ChronoUnit.HOURS));
        d3.setPickupStartTime(now.minus(1, ChronoUnit.HOURS));
        d3.setExpiresAt(now.plus(72, ChronoUnit.HOURS));
        d3.setPickupAddress("Central Depot, Lower Parel, Mumbai");
        d3.setLatitude(18.9980);
        d3.setLongitude(72.8310);
        d3.setSpecialInstructions("Loading ramp available. Forklift assistance on site.");
        d3.setStatus(DonationStatus.CLAIMED);
        donationRepository.save(d3);

        FoodClaim claim1 = new FoodClaim(d3, savedNgo);
        claimRepository.save(claim1);

        // Donation D: VOLUNTEER_ASSIGNED (Fresh Cut Fruit Melons & Pineapples)
        FoodDonation d4 = new FoodDonation();
        d4.setDonor(savedDonor);
        d4.setTitle("Chilled Mixed Fruit Platters");
        d4.setFoodCategory(FoodCategory.FRUITS_VEGETABLES);
        d4.setDescription("Hygienically sliced seasonal fruits including watermelon, papaya, and pineapple in sealed trays.");
        d4.setVegetarian(true);
        d4.setAllergenInformation("None");
        d4.setNumberOfServings(50);
        d4.setEstimatedWeightKg(18.0);
        d4.setPreparedAt(now.minus(3, ChronoUnit.HOURS));
        d4.setPickupStartTime(now.minus(1, ChronoUnit.HOURS));
        d4.setExpiresAt(now.plus(5, ChronoUnit.HOURS));
        d4.setPickupAddress("Banquet Hall 3, Worli Seaface, Mumbai");
        d4.setLatitude(19.0120);
        d4.setLongitude(72.8180);
        d4.setSpecialInstructions("Chilled transport required. Temperature < 8 degrees C.");
        d4.setStatus(DonationStatus.VOLUNTEER_ASSIGNED);
        donationRepository.save(d4);

        FoodClaim claim2 = new FoodClaim(d4, savedNgo);
        claimRepository.save(claim2);

        PickupAssignment assignment1 = new PickupAssignment(claim2, savedVolunteer);
        assignmentRepository.save(assignment1);
        qrService.createPickupVerification(d4, assignment1);

        // Donation E: DELIVERED (Catered Lunch Boxes)
        FoodDonation d5 = new FoodDonation();
        d5.setDonor(savedDonor);
        d5.setTitle("Corporate Seminar Executive Thali Boxes");
        d5.setFoodCategory(FoodCategory.COOKED_FOOD);
        d5.setDescription("Deluxe Indian vegetarian lunch boxes (Paneer Makhani, Dal Tadka, Jeera Rice, Rotis, Gulab Jamun).");
        d5.setVegetarian(true);
        d5.setAllergenInformation("Dairy, gluten");
        d5.setNumberOfServings(85);
        d5.setEstimatedWeightKg(32.0);
        d5.setPreparedAt(now.minus(28, ChronoUnit.HOURS));
        d5.setPickupStartTime(now.minus(26, ChronoUnit.HOURS));
        d5.setExpiresAt(now.minus(18, ChronoUnit.HOURS));
        d5.setPickupAddress("Convention Center, BKC, Mumbai");
        d5.setLatitude(19.0660);
        d5.setLongitude(72.8680);
        d5.setStatus(DonationStatus.DELIVERED);
        donationRepository.save(d5);

        FoodClaim claim3 = new FoodClaim(d5, savedNgo);
        claim3.setStatus(ClaimStatus.COMPLETED);
        claimRepository.save(claim3);

        PickupAssignment assignment2 = new PickupAssignment(claim3, savedVolunteer);
        assignment2.setStatus(PickupStatus.DELIVERED);
        assignment2.setPickedUpAt(now.minus(24, ChronoUnit.HOURS));
        assignment2.setDeliveredAt(now.minus(22, ChronoUnit.HOURS));
        assignmentRepository.save(assignment2);

        // Donation F: EXPIRED (Lunch Buffet Leftovers)
        FoodDonation d6 = new FoodDonation();
        d6.setDonor(savedDonor);
        d6.setTitle("Breakfast & Brunch Buffet Surplus");
        d6.setFoodCategory(FoodCategory.COOKED_FOOD);
        d6.setDescription("Buffet surplus items that exceeded safe room temperature holding time.");
        d6.setVegetarian(true);
        d6.setAllergenInformation("Dairy, gluten");
        d6.setNumberOfServings(30);
        d6.setEstimatedWeightKg(11.0);
        d6.setPreparedAt(now.minus(12, ChronoUnit.HOURS));
        d6.setPickupStartTime(now.minus(10, ChronoUnit.HOURS));
        d6.setExpiresAt(now.minus(2, ChronoUnit.HOURS));
        d6.setPickupAddress("Boutique Hotel Cafe, Juhu, Mumbai");
        d6.setLatitude(19.0988);
        d6.setLongitude(72.8264);
        d6.setStatus(DonationStatus.EXPIRED);
        donationRepository.save(d6);

        logger.info("FoodBridge sample data successfully seeded!");
    }
}
