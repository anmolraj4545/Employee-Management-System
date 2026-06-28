package com.ems.leave.controller;

import com.ems.common.ApiResponse;
import com.ems.leave.dto.LeaveTypeResponse;
import com.ems.leave.repository.LeaveTypeRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Leave Types", description = "Read-only list of configured leave types")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/leave-types")
@RequiredArgsConstructor
public class LeaveTypeController {

    private final LeaveTypeRepository leaveTypeRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveTypeResponse>>> getAll() {
        List<LeaveTypeResponse> response = leaveTypeRepository.findAll().stream()
                .map(t -> LeaveTypeResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .defaultAnnualDays(t.getDefaultAnnualDays())
                        .build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Leave types fetched", response));
    }
}
