package com.foodbridge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbridge.dto.auth.LoginRequest;
import com.foodbridge.dto.auth.RegisterRequest;
import com.foodbridge.entity.enums.OrganizationType;
import com.foodbridge.entity.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should successfully authenticate pre-seeded admin user")
    void testLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@foodbridge.local", "Admin@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("admin@foodbridge.local")))
                .andExpect(jsonPath("$.data.user.role", is("ADMIN")));
    }

    @Test
    @DisplayName("Should reject invalid login credentials")
    void testLoginFailure() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@foodbridge.local", "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("Should register new volunteer and return JWT")
    void testRegisterVolunteer() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setFullName("Test Volunteer");
        register.setEmail("test-volunteer@example.com");
        register.setPassword("Password@123");
        register.setPhone("+91 99999 88888");
        register.setRole(Role.VOLUNTEER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("test-volunteer@example.com")))
                .andExpect(jsonPath("$.data.user.role", is("VOLUNTEER")));
    }

    @Test
    @DisplayName("Should reject duplicate registration email")
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setFullName("Duplicate Donor");
        register.setEmail("donor@foodbridge.local");
        register.setPassword("Password@123");
        register.setRole(Role.DONOR);
        register.setOrganizationName("Duplicate Org");
        register.setOrganizationType(OrganizationType.RESTAURANT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }
}
