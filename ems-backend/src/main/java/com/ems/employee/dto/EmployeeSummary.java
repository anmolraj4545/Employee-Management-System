package com.ems.employee.dto;

import com.ems.common.enums.EmployeeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSummary {
    private Long id;
    private String employeeCode;
    private String fullName;
    private String email;
    private String departmentName;
    private String designationTitle;
    private String profilePhotoUrl;
    private EmployeeStatus status;
}
