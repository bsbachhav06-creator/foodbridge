package com.foodbridge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbridge.dto.auth.LoginRequest;
import com.foodbridge.dto.donation.CreateDonationRequest;
import com.foodbridge.entity.enums.FoodCategory;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DonationWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String donorToken;

    @BeforeEach
    void setup() throws Exception {
        LoginRequest login = new LoginRequest("donor@foodbridge.local", "Donor@123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        donorToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("token").asText();
    }

    @Test
    @DisplayName("Donor should successfully post surplus food")
    void testCreateDonation() throws Exception {
        CreateDonationRequest request = new CreateDonationRequest();
        request.setTitle("Steamed Rice & Dal Makhani");
        request.setFoodCategory(FoodCategory.COOKED_FOOD);
        request.setDescription("Fresh banquet surplus in stainless steel insulated trays.");
        request.setVegetarian(true);
        request.setAllergenInformation("Dairy");
        request.setNumberOfServings(35);
        request.setEstimatedWeightKg(12.5);
        request.setPreparedAt(Instant.now().minus(1, ChronoUnit.HOURS));
        request.setPickupStartTime(Instant.now());
        request.setExpiresAt(Instant.now().plus(8, ChronoUnit.HOURS));
        request.setPickupAddress("12 Marine Drive, Nariman Point, Mumbai");
        request.setLatitude(18.9256);
        request.setLongitude(72.8242);
        request.setSpecialInstructions("Ring service doorbell at Gate B");

        mockMvc.perform(post("/api/donations")
                        .header("Authorization", "Bearer " + donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Steamed Rice & Dal Makhani")))
                .andExpect(jsonPath("$.data.status", is("AVAILABLE")))
                .andExpect(jsonPath("$.data.numberOfServings", is(35)));
    }

    @Test
    @DisplayName("Should retrieve nearby available donations within radius")
    void testGetNearbyDonations() throws Exception {
        mockMvc.perform(get("/api/donations/nearby")
                        .param("latitude", "18.9256")
                        .param("longitude", "72.8242")
                        .param("radiusKm", "10.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }
}
