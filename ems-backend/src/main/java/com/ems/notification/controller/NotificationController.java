package com.ems.notification.controller;

import com.ems.common.ApiResponse;
import com.ems.common.PageResponse;
import com.ems.notification.dto.NotificationResponse;
import com.ems.notification.service.NotificationService;
import com.ems.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Notifications", description = "Real-time-ish notifications (poll-based)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> myNotifications(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<NotificationResponse> response =
                PageResponse.from(notificationService.getMyNotifications(user.getUserId(), pageable));
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", response));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount(
            @AuthenticationPrincipal CustomUserDetails user) {
        long count = notificationService.getUnreadCount(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched", Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails user) {
        notificationService.markAsRead(id, user.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal CustomUserDetails user) {
        notificationService.markAllAsRead(user.getUserId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
