package com.ems.employee.mapper;

import com.ems.department.entity.Department;
import com.ems.department.entity.Designation;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.employee.dto.EmployeeSummary;
import com.ems.employee.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public EmployeeResponse toResponse(Employee e) {
        if (e == null) return null;

        Department dept = e.getDepartment();
        Designation designation = e.getDesignation();
        Employee manager = e.getManager();

        return EmployeeResponse.builder()
                .id(e.getId())
                .employeeCode(e.getEmployeeCode())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .fullName(e.getFullName())
                .email(e.getEmail())
                .phoneNumber(e.getPhoneNumber())
                .gender(e.getGender())
                .dateOfBirth(e.getDateOfBirth())
                .address(e.getAddress())
                .city(e.getCity())
                .state(e.getState())
                .country(e.getCountry())
                .joiningDate(e.getJoiningDate())
                .departmentId(dept != null ? dept.getId() : null)
                .departmentName(dept != null ? dept.getName() : null)
                .designationId(designation != null ? designation.getId() : null)
                .designationTitle(designation != null ? designation.getTitle() : null)
                .managerId(manager != null ? manager.getId() : null)
                .managerName(manager != null ? manager.getFullName() : null)
                .salary(e.getSalary())
                .profilePhotoUrl(e.getProfilePhotoUrl())
                .emergencyContactName(e.getEmergencyContactName())
                .emergencyContactPhone(e.getEmergencyContactPhone())
                .status(e.getStatus())
                .username(e.getUser() != null ? e.getUser().getUsername() : null)
                .role(e.getUser() != null && e.getUser().getRole() != null
                        ? e.getUser().getRole().getName().name() : null)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public EmployeeSummary toSummary(Employee e) {
        if (e == null) return null;

        Department dept = e.getDepartment();
        Designation designation = e.getDesignation();

        return EmployeeSummary.builder()
                .id(e.getId())
                .employeeCode(e.getEmployeeCode())
                .fullName(e.getFullName())
                .email(e.getEmail())
                .departmentName(dept != null ? dept.getName() : null)
                .designationTitle(designation != null ? designation.getTitle() : null)
                .profilePhotoUrl(e.getProfilePhotoUrl())
                .status(e.getStatus())
                .build();
    }
}
