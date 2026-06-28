package com.ems.attendance.controller;

import com.ems.attendance.dto.AttendanceResponse;
import com.ems.attendance.dto.AttendanceSummary;
import com.ems.attendance.dto.AttendanceUpdateRequest;
import com.ems.attendance.service.AttendanceService;
import com.ems.common.ApiResponse;
import com.ems.common.PageResponse;
import com.ems.common.enums.AttendanceStatus;
import com.ems.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Attendance", description = "Check-in/out, attendance history, admin management, and analytics")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(@AuthenticationPrincipal CustomUserDetails user) {
        AttendanceResponse response = attendanceService.checkIn(requireEmployeeId(user));
        return ResponseEntity.ok(ApiResponse.success("Checked in successfully", response));
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(@AuthenticationPrincipal CustomUserDetails user) {
        AttendanceResponse response = attendanceService.checkOut(requireEmployeeId(user));
        return ResponseEntity.ok(ApiResponse.success("Checked out successfully", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getOwnHistory(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<AttendanceResponse> response = attendanceService.getOwnHistory(requireEmployeeId(user), start, end);
        return ResponseEntity.ok(ApiResponse.success("Attendance history fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getEmployeeHistory(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<AttendanceResponse> response = attendanceService.getOwnHistory(employeeId, start, end);
        return ResponseEntity.ok(ApiResponse.success("Attendance history fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> manualUpdate(
            @PathVariable Long id, @Valid @RequestBody AttendanceUpdateRequest request) {
        AttendanceResponse response = attendanceService.manualUpdate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Attendance record updated", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/report")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceResponse>>> report(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) AttendanceStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<AttendanceResponse> response = PageResponse.from(
                attendanceService.search(employeeId, departmentId, start, end, status, pageable));
        return ResponseEntity.ok(ApiResponse.success("Attendance report fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/summary/today")
    public ResponseEntity<ApiResponse<AttendanceSummary>> todaySummary() {
        AttendanceSummary response = attendanceService.getTodaySummary();
        return ResponseEntity.ok(ApiResponse.success("Today's attendance summary fetched", response));
    }

    private Long requireEmployeeId(CustomUserDetails user) {
        if (user.getEmployeeId() == null) {
            throw new com.ems.common.exception.BadRequestException(
                    "No employee profile is linked to this account");
        }
        return user.getEmployeeId();
    }
}
