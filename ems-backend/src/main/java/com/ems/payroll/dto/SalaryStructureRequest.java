package com.ems.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SalaryStructureRequest {

    @NotNull(message = "Employee is required")
    private Long employeeId;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.0", message = "Basic salary cannot be negative")
    private BigDecimal basicSalary;

    @DecimalMin(value = "0.0", message = "HRA cannot be negative")
    private BigDecimal hra;

    @DecimalMin(value = "0.0", message = "Bonus cannot be negative")
    private BigDecimal bonus;

    @DecimalMin(value = "0.0", message = "Incentive cannot be negative")
    private BigDecimal incentive;

    @DecimalMin(value = "0.0", message = "PF percent cannot be negative")
    private BigDecimal pfPercent;

    @DecimalMin(value = "0.0", message = "Tax percent cannot be negative")
    private BigDecimal taxPercent;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;
}
