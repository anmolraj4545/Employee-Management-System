package com.ems.department.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentAnalytics {
    private Long departmentId;
    private String departmentName;
    private long totalEmployees;
    private long activeEmployees;
    private BigDecimal totalMonthlySalary;
    private BigDecimal averageSalary;
}
