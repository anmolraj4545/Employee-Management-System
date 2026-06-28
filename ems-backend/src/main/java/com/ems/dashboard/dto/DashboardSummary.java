package com.ems.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {
    private long totalEmployees;
    private long activeEmployees;
    private long presentToday;
    private long absentToday;
    private long lateToday;
    private long totalDepartments;
    private long pendingLeaveRequests;
    private BigDecimal currentMonthPayroll;
}
