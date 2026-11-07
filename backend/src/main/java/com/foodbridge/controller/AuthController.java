package com.foodbridge.controller;

import com.foodbridge.dto.auth.AuthResponse;
import com.foodbridge.dto.auth.LoginRequest;
import com.foodbridge.dto.auth.RegisterRequest;
import com.foodbridge.dto.auth.UserDto;
import com.foodbridge.dto.common.ApiResponse;
import com.foodbridge.entity.User;
import com.foodbridge.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, and session info")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Registers a donor, NGO, or volunteer account.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user credentials and returns a JWT access token.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Returns profile of currently authenticated user.")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.ok(authService.mapToUserDto(user)));
    }
}
