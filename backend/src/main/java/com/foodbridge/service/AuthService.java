package com.foodbridge.service;

import com.foodbridge.dto.auth.*;
import com.foodbridge.entity.OrganizationProfile;
import com.foodbridge.entity.User;
import com.foodbridge.entity.enums.Role;
import com.foodbridge.entity.enums.VerificationStatus;
import com.foodbridge.exception.BadRequestException;
import com.foodbridge.exception.ResourceNotFoundException;
import com.foodbridge.exception.UnauthorizedException;
import com.foodbridge.repository.OrganizationProfileRepository;
import com.foodbridge.repository.UserRepository;
import com.foodbridge.security.JwtTokenProvider;
import com.foodbridge.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationProfileRepository organizationProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       OrganizationProfileRepository organizationProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.organizationProfileRepository = organizationProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new BadRequestException("Email address is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // If DONOR or NGO, handle OrganizationProfile
        if (request.getRole() == Role.DONOR || request.getRole() == Role.NGO) {
            if (request.getOrganizationName() == null || request.getOrganizationName().isBlank()) {
                throw new BadRequestException("Organization name is required for " + request.getRole());
            }

            OrganizationProfile profile = new OrganizationProfile();
            profile.setUser(savedUser);
            profile.setOrganizationName(request.getOrganizationName());
            profile.setOrganizationType(request.getOrganizationType());
            profile.setAddress(request.getAddress() != null ? request.getAddress() : "Address not provided");
            profile.setCity(request.getCity() != null ? request.getCity() : "Mumbai");
            profile.setLatitude(request.getLatitude() != null ? request.getLatitude() : 19.0760);
            profile.setLongitude(request.getLongitude() != null ? request.getLongitude() : 72.8777);
            profile.setOperatingHours(request.getOperatingHours());

            // NGOs require admin approval; donors are verified immediately for platform agility
            if (request.getRole() == Role.NGO) {
                profile.setVerificationStatus(VerificationStatus.PENDING);
            } else {
                profile.setVerificationStatus(VerificationStatus.VERIFIED);
            }

            OrganizationProfile savedProfile = organizationProfileRepository.save(profile);
            savedUser.setOrganizationProfile(savedProfile);
        }

        // Send welcome notification
        notificationService.createNotification(
                savedUser,
                "Welcome to FoodBridge!",
                "Thank you for joining FoodBridge as a " + savedUser.getRole() + ". Let's make an impact together!",
                "WELCOME"
        );

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);
        return new AuthResponse(token, mapToUserDto(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact support.");
        }

        return new AuthResponse(token, mapToUserDto(user));
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            throw new UnauthorizedException("User is not authenticated");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public UserDto mapToUserDto(User user) {
        OrganizationDto orgDto = null;
        if (user.getOrganizationProfile() != null) {
            OrganizationProfile org = user.getOrganizationProfile();
            orgDto = new OrganizationDto(
                    org.getId(),
                    org.getOrganizationName(),
                    org.getOrganizationType(),
                    org.getAddress(),
                    org.getCity(),
                    org.getLatitude(),
                    org.getLongitude(),
                    org.getOperatingHours(),
                    org.getVerificationStatus()
            );
        }

        return new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive(),
                orgDto
        );
    }
}
