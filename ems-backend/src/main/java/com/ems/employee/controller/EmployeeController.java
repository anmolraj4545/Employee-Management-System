package com.ems.employee.controller;

import com.ems.common.ApiResponse;
import com.ems.common.PageResponse;
import com.ems.common.enums.EmployeeStatus;
import com.ems.employee.dto.EmployeeRequest;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.employee.dto.EmployeeSummary;
import com.ems.employee.service.EmployeeService;
import com.ems.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Employees", description = "Employee CRUD, search, and profile management")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deactivated successfully"));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployee(@PathVariable Long id) {
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success("Employee fetched", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getOwnProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        EmployeeResponse response = employeeService.getEmployeeByUserId(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeSummary>>> searchEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) EmployeeStatus status,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        PageResponse<EmployeeSummary> response =
                PageResponse.from(employeeService.searchEmployees(search, departmentId, status, pageable));
        return ResponseEntity.ok(ApiResponse.success("Employees fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/dropdown")
    public ResponseEntity<ApiResponse<List<EmployeeSummary>>> getDropdownList() {
        List<EmployeeSummary> response = employeeService.getAllActiveForDropdown();
        return ResponseEntity.ok(ApiResponse.success("Active employees fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}/photo")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updatePhoto(
            @PathVariable Long id, @RequestParam String photoUrl) {
        // Actual multipart file upload + storage is implemented when the file-storage module is built;
        // this accepts a pre-uploaded URL for now to keep the contract stable.
        EmployeeResponse response = employeeService.updateProfilePhoto(id, photoUrl);
        return ResponseEntity.ok(ApiResponse.success("Profile photo updated", response));
    }
}
