package com.foodbridge.controller;

import com.foodbridge.dto.common.ApiResponse;
import com.foodbridge.dto.notification.NotificationResponse;
import com.foodbridge.entity.User;
import com.foodbridge.service.AuthService;
import com.foodbridge.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for viewing and marking user notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get user notifications", description = "Returns notifications for the current authenticated user.")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        User user = authService.getCurrentAuthenticatedUser();
        List<NotificationResponse> list = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
