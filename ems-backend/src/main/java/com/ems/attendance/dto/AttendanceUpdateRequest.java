package com.ems.attendance.dto;

import com.ems.common.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttendanceUpdateRequest {

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private String remarks;
}
