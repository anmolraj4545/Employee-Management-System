package com.ems.payroll.dto;

import com.ems.common.enums.PayslipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private int payMonth;
    private int payYear;
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal bonus;
    private BigDecimal incentive;
    private BigDecimal pfDeduction;
    private BigDecimal taxDeduction;
    private BigDecimal otherDeductions;
    private BigDecimal grossSalary;
    private BigDecimal netSalary;
    private PayslipStatus status;
    private LocalDateTime generatedAt;
}
