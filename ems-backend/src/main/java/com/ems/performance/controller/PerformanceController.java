package com.ems.performance.controller;

import com.ems.common.ApiResponse;
import com.ems.common.exception.BadRequestException;
import com.ems.performance.dto.PerformanceReviewRequest;
import com.ems.performance.dto.PerformanceReviewResponse;
import com.ems.performance.service.PerformanceService;
import com.ems.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Performance", description = "Employee performance reviews and ratings")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> createReview(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody PerformanceReviewRequest request) {
        PerformanceReviewResponse response = performanceService.createReview(requireEmployeeId(user), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Review submitted", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> getEmployeeReviews(
            @PathVariable Long employeeId) {
        List<PerformanceReviewResponse> response = performanceService.getReviewsForEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> myReviews(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<PerformanceReviewResponse> response = performanceService.getReviewsForEmployee(requireEmployeeId(user));
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched", response));
    }

    private Long requireEmployeeId(CustomUserDetails user) {
        if (user.getEmployeeId() == null) {
            throw new BadRequestException("No employee profile is linked to this account");
        }
        return user.getEmployeeId();
    }
}
