package com.foodbridge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbridge.dto.auth.LoginRequest;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.enums.DonationStatus;
import com.foodbridge.entity.enums.FoodCategory;
import com.foodbridge.repository.FoodDonationRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class NgoClaimRulesTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FoodDonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    private String verifiedNgoToken;
    private String unverifiedNgoToken;
    private String donorToken;
    private Long testDonationId;

    @BeforeEach
    void setup() throws Exception {
        // Log in verified NGO
        LoginRequest ngoLogin = new LoginRequest("ngo@foodbridge.local", "Ngo@123");
        MvcResult ngoRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ngoLogin)))
                .andReturn();
        verifiedNgoToken = objectMapper.readTree(ngoRes.getResponse().getContentAsString())
                .path("data").path("token").asText();

        // Log in unverified NGO
        LoginRequest unverifiedLogin = new LoginRequest("unverified-ngo@foodbridge.local", "Ngo@123");
        MvcResult unverifiedRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unverifiedLogin)))
                .andReturn();
        unverifiedNgoToken = objectMapper.readTree(unverifiedRes.getResponse().getContentAsString())
                .path("data").path("token").asText();

        // Log in Donor
        LoginRequest donorLogin = new LoginRequest("donor@foodbridge.local", "Donor@123");
        MvcResult donorRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(donorLogin)))
                .andReturn();
        donorToken = objectMapper.readTree(donorRes.getResponse().getContentAsString())
                .path("data").path("token").asText();

        // Create a dedicated AVAILABLE donation for claiming tests
        FoodDonation d = new FoodDonation();
        d.setDonor(userRepository.findByEmail("donor@foodbridge.local").orElseThrow());
        d.setTitle("Test Surplus For Claiming");
        d.setFoodCategory(FoodCategory.COOKED_FOOD);
        d.setNumberOfServings(25);
        d.setEstimatedWeightKg(8.0);
        d.setPreparedAt(Instant.now().minus(1, ChronoUnit.HOURS));
        d.setPickupStartTime(Instant.now());
        d.setExpiresAt(Instant.now().plus(4, ChronoUnit.HOURS));
        d.setPickupAddress("Test Location, Mumbai");
        d.setLatitude(19.0760);
        d.setLongitude(72.8777);
        d.setStatus(DonationStatus.AVAILABLE);
        FoodDonation saved = donationRepository.save(d);
        testDonationId = saved.getId();
    }

    @Test
    @DisplayName("Verified NGO should successfully claim available donation")
    void testVerifiedNgoCanClaim() throws Exception {
        mockMvc.perform(post("/api/donations/" + testDonationId + "/claim")
                        .header("Authorization", "Bearer " + verifiedNgoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.donationTitle", is("Test Surplus For Claiming")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));
    }

    @Test
    @DisplayName("Unverified NGO cannot claim donation")
    void testUnverifiedNgoCannotClaim() throws Exception {
        mockMvc.perform(post("/api/donations/" + testDonationId + "/claim")
                        .header("Authorization", "Bearer " + unverifiedNgoToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("pending admin verification")));
    }

    @Test
    @DisplayName("Donor cannot claim own donation")
    void testDonorCannotClaimOwnDonation() throws Exception {
        mockMvc.perform(post("/api/donations/" + testDonationId + "/claim")
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isForbidden()); // Role check or BadRequest
    }
}
