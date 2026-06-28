package com.ems.performance.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PerformanceReviewRequest {

    @NotNull(message = "Employee is required")
    private Long employeeId;

    @NotBlank(message = "Review period is required (format: YYYY-MM)")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Review period must be in YYYY-MM format")
    private String reviewPeriod;

    @NotNull(message = "Rating is required")
    @DecimalMin(value = "0.0", message = "Rating must be at least 0.0")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5.0")
    private BigDecimal rating;

    private String comments;
}
