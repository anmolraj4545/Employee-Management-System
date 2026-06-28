package com.ems.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummary {
    private LocalDate date;
    private long totalEmployees;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long onLeaveCount;
}
