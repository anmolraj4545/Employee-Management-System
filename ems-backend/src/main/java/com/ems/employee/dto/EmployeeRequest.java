package com.ems.employee.dto;

import com.ems.common.enums.EmployeeStatus;
import com.ems.common.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must be at most 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must be at most 50 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @Pattern(regexp = "^$|^[+0-9 ()-]{7,20}$", message = "Invalid phone number format")
    private String phoneNumber;

    private Gender gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 255)
    private String address;

    @Size(max = 50)
    private String city;

    @Size(max = 50)
    private String state;

    @Size(max = 50)
    private String country;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    private Long departmentId;

    private Long designationId;

    private Long managerId;

    @DecimalMin(value = "0.0", inclusive = true, message = "Salary cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Salary has an invalid format")
    private BigDecimal salary;

    @Size(max = 100)
    private String emergencyContactName;

    @Pattern(regexp = "^$|^[+0-9 ()-]{7,20}$", message = "Invalid emergency contact phone format")
    private String emergencyContactPhone;

    private EmployeeStatus status;

    /** Only used on creation - sets up the linked login account. Ignored on update. */
    private String username;

    /** Only used on creation - initial password for the linked login account. Ignored on update. */
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String role; // SUPER_ADMIN | HR_MANAGER | EMPLOYEE — only used on creation
}
