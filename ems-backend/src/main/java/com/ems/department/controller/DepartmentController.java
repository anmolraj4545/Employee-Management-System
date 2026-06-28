package com.ems.department.controller;

import com.ems.common.ApiResponse;
import com.ems.department.dto.DepartmentAnalytics;
import com.ems.department.dto.DepartmentRequest;
import com.ems.department.dto.DepartmentResponse;
import com.ems.department.service.DepartmentService;
import com.ems.employee.dto.EmployeeSummary;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Departments", description = "Department CRUD, employee listing, and analytics")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse response = departmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long id, @Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse response = departmentService.updateDepartment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAllDepartments() {
        List<DepartmentResponse> response = departmentService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success("Departments fetched", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartment(@PathVariable Long id) {
        DepartmentResponse response = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Department fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/{id}/employees")
    public ResponseEntity<ApiResponse<List<EmployeeSummary>>> getDepartmentEmployees(@PathVariable Long id) {
        List<EmployeeSummary> response = departmentService.getDepartmentEmployees(id);
        return ResponseEntity.ok(ApiResponse.success("Department employees fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/{id}/analytics")
    public ResponseEntity<ApiResponse<DepartmentAnalytics>> getDepartmentAnalytics(@PathVariable Long id) {
        DepartmentAnalytics response = departmentService.getDepartmentAnalytics(id);
        return ResponseEntity.ok(ApiResponse.success("Department analytics fetched", response));
    }
}
