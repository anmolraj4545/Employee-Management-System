package com.ems.dashboard.controller;

import com.ems.common.ApiResponse;
import com.ems.dashboard.dto.AttendanceTrendPoint;
import com.ems.dashboard.dto.ChartDataPoint;
import com.ems.dashboard.dto.DashboardSummary;
import com.ems.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Dashboard", description = "Aggregated stats, charts, and summaries for the main dashboard")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummary>> getSummary() {
        DashboardSummary response = dashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary fetched", response));
    }

    @GetMapping("/charts/attendance")
    public ResponseEntity<ApiResponse<List<AttendanceTrendPoint>>> getAttendanceTrend(
            @RequestParam(defaultValue = "7") int days) {
        List<AttendanceTrendPoint> response = dashboardService.getAttendanceTrend(Math.min(days, 90));
        return ResponseEntity.ok(ApiResponse.success("Attendance trend fetched", response));
    }

    @GetMapping("/charts/department-distribution")
    public ResponseEntity<ApiResponse<List<ChartDataPoint>>> getDepartmentDistribution() {
        List<ChartDataPoint> response = dashboardService.getDepartmentDistribution();
        return ResponseEntity.ok(ApiResponse.success("Department distribution fetched", response));
    }
}
