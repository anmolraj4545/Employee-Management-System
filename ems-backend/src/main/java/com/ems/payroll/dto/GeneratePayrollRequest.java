package com.ems.payroll.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GeneratePayrollRequest {

    @NotNull(message = "Pay month is required")
    @Min(value = 1, message = "Pay month must be between 1 and 12")
    @Max(value = 12, message = "Pay month must be between 1 and 12")
    private Integer payMonth;

    @NotNull(message = "Pay year is required")
    @Min(value = 2000, message = "Pay year must be a valid year")
    private Integer payYear;

    /** If null, payroll is generated for all active employees with a salary structure. */
    private Long employeeId;
}
