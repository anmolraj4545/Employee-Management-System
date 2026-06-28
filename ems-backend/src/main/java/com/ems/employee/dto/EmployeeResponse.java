package com.ems.employee.dto;

import com.ems.common.enums.EmployeeStatus;
import com.ems.common.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String address;
    private String city;
    private String state;
    private String country;
    private LocalDate joiningDate;

    private Long departmentId;
    private String departmentName;

    private Long designationId;
    private String designationTitle;

    private Long managerId;
    private String managerName;

    private BigDecimal salary;
    private String profilePhotoUrl;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private EmployeeStatus status;

    private String username;
    private String role;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
