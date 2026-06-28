package com.ems.holiday.controller;

import com.ems.common.ApiResponse;
import com.ems.holiday.dto.HolidayRequest;
import com.ems.holiday.dto.HolidayResponse;
import com.ems.holiday.service.HolidayService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Holidays", description = "Company holiday calendar management")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService holidayService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<HolidayResponse>> create(@Valid @RequestBody HolidayRequest request) {
        HolidayResponse response = holidayService.createHoliday(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Holiday created", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HolidayResponse>> update(
            @PathVariable Long id, @Valid @RequestBody HolidayRequest request) {
        HolidayResponse response = holidayService.updateHoliday(id, request);
        return ResponseEntity.ok(ApiResponse.success("Holiday updated", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.ok(ApiResponse.success("Holiday deleted"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<HolidayResponse> response = (start != null && end != null)
                ? holidayService.getHolidaysInRange(start, end)
                : holidayService.getAllHolidays();
        return ResponseEntity.ok(ApiResponse.success("Holidays fetched", response));
    }
}
