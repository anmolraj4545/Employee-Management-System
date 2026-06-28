package com.ems.notice.controller;

import com.ems.common.ApiResponse;
import com.ems.common.PageResponse;
import com.ems.notice.dto.NoticeRequest;
import com.ems.notice.dto.NoticeResponse;
import com.ems.notice.service.NoticeService;
import com.ems.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Notice Board", description = "Company-wide notices and announcements")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<NoticeResponse>> create(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody NoticeRequest request) {
        NoticeResponse response = noticeService.createNotice(user.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Notice published", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeResponse>> update(
            @PathVariable Long id, @Valid @RequestBody NoticeRequest request) {
        NoticeResponse response = noticeService.updateNotice(id, request);
        return ResponseEntity.ok(ApiResponse.success("Notice updated", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok(ApiResponse.success("Notice removed"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NoticeResponse>>> getAll(
            @PageableDefault(size = 10) Pageable pageable) {
        PageResponse<NoticeResponse> response = PageResponse.from(noticeService.getActiveNotices(pageable));
        return ResponseEntity.ok(ApiResponse.success("Notices fetched", response));
    }
}
