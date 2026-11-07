package com.foodbridge;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbridge.dto.auth.LoginRequest;
import com.foodbridge.dto.qr.QrVerificationRequest;
import com.foodbridge.entity.FoodClaim;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.PickupAssignment;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.FoodCategory;
import com.foodbridge.entity.enums.PickupStatus;
import com.foodbridge.repository.FoodClaimRepository;
import com.foodbridge.repository.FoodDonationRepository;
import com.foodbridge.repository.PickupAssignmentRepository;
import com.foodbridge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class VolunteerPickupAndQrTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private FoodClaimRepository claimRepository;

    @Autowired
    private PickupAssignmentRepository assignmentRepository;

    @Autowired
    private UserRepository userRepository;

    private String donorToken;
    private String ngoToken;
    private String volunteerToken;
    private Long claimId;
    private Long donationId;

    @BeforeEach
    void setup() throws Exception {
        // Log in donor, ngo, volunteer
        donorToken = loginUser("donor@foodbridge.local", "Donor@123");
        ngoToken = loginUser("ngo@foodbridge.local", "Ngo@123");
        volunteerToken = loginUser("volunteer@foodbridge.local", "Volunteer@123");

        User donor = userRepository.findByEmail("donor@foodbridge.local").orElseThrow();
        User ngo = userRepository.findByEmail("ngo@foodbridge.local").orElseThrow();
        User volunteer = userRepository.findByEmail("volunteer@foodbridge.local").orElseThrow();

        // Clear existing active assignments for this volunteer to ensure clean test state
        List<PickupAssignment> existing = assignmentRepository.findByVolunteerIdAndStatusIn(
                volunteer.getId(),
                Arrays.asList(PickupStatus.ACCEPTED, PickupStatus.PICKED_UP)
        );
        for (PickupAssignment a : existing) {
            a.setStatus(PickupStatus.CANCELLED);
            assignmentRepository.save(a);
        }

        // Create donation
        FoodDonation d = new FoodDonation();
        d.setDonor(donor);
        d.setTitle("Hot Soup and Sandwiches");
        d.setFoodCategory(FoodCategory.COOKED_FOOD);
        d.setNumberOfServings(50);
        d.setEstimatedWeightKg(20.0);
        d.setPreparedAt(Instant.now().minus(1, ChronoUnit.HOURS));
        d.setPickupStartTime(Instant.now());
        d.setExpiresAt(Instant.now().plus(6, ChronoUnit.HOURS));
        d.setPickupAddress("Community Center, Mumbai");
        d.setLatitude(19.0760);
        d.setLongitude(72.8777);
        d.setStatus(DonationStatus.CLAIMED);
        FoodDonation savedDonation = donationRepository.save(d);
        donationId = savedDonation.getId();

        // Create claim
        FoodClaim claim = new FoodClaim(savedDonation, ngo);
        FoodClaim savedClaim = claimRepository.save(claim);
        claimId = savedClaim.getId();
    }

    private String loginUser(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest(email, password);
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString())
                .path("data").path("token").asText();
    }

    @Test
    @DisplayName("End-to-End Pickup Acceptance -> Pickup QR Verify -> Delivery QR Verify")
    void testFullPickupAndDeliveryFlow() throws Exception {
        // Step 1: Volunteer accepts pickup task
        MvcResult acceptResult = mockMvc.perform(post("/api/pickups/" + claimId + "/accept")
                        .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("ACCEPTED")))
                .andReturn();

        Long assignmentId = objectMapper.readTree(acceptResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // Step 2: Volunteer should be prevented from accepting another task while one is active
        mockMvc.perform(post("/api/pickups/" + claimId + "/accept")
                        .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already have an active pickup task")));

        // Step 3: Donor fetches Pickup QR code
        MvcResult pickupQrResult = mockMvc.perform(get("/api/qr/pickup/" + assignmentId)
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.qrCodeBase64", startsWith("data:image/png;base64,")))
                .andReturn();

        String pickupToken = objectMapper.readTree(pickupQrResult.getResponse().getContentAsString())
                .path("data").path("token").asText();

        // Step 4: Volunteer verifies pickup using the token
        QrVerificationRequest pickupVerifyReq = new QrVerificationRequest(pickupToken);
        mockMvc.perform(post("/api/qr/verify")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pickupVerifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verified", is(true)))
                .andExpect(jsonPath("$.data.verificationType", is("PICKUP")));

        // Check donation status updated to PICKED_UP
        FoodDonation pickedUpDonation = donationRepository.findById(donationId).orElseThrow();
        assertEquals(DonationStatus.PICKED_UP, pickedUpDonation.getStatus());

        // Step 5: NGO fetches Delivery QR code
        MvcResult deliveryQrResult = mockMvc.perform(get("/api/qr/delivery/" + assignmentId)
                        .header("Authorization", "Bearer " + ngoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.qrCodeBase64", startsWith("data:image/png;base64,")))
                .andReturn();

        String deliveryToken = objectMapper.readTree(deliveryQrResult.getResponse().getContentAsString())
                .path("data").path("token").asText();

        // Step 6: Volunteer verifies delivery using the token
        QrVerificationRequest deliveryVerifyReq = new QrVerificationRequest(deliveryToken);
        mockMvc.perform(post("/api/qr/verify")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deliveryVerifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verified", is(true)))
                .andExpect(jsonPath("$.data.verificationType", is("DELIVERY")));

        // Check donation status updated to DELIVERED
        FoodDonation deliveredDonation = donationRepository.findById(donationId).orElseThrow();
        assertEquals(DonationStatus.DELIVERED, deliveredDonation.getStatus());

        // Step 7: Check impact dashboard reflects the delivered meals
        mockMvc.perform(get("/api/dashboard/impact"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.mealsSaved", greaterThanOrEqualTo(50)));
    }
}
