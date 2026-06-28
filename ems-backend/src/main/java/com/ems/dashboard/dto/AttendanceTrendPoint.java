package com.ems.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceTrendPoint {
    private LocalDate date;
    private long presentCount;
    private long absentCount;
    private long lateCount;
}
