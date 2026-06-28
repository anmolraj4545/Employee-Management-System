package com.ems.department.controller;

import com.ems.common.ApiResponse;
import com.ems.department.dto.DesignationRequest;
import com.ems.department.dto.DesignationResponse;
import com.ems.department.service.DesignationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Designations", description = "Job designation/title CRUD")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/designations")
@RequiredArgsConstructor
public class DesignationController {

    private final DesignationService designationService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<DesignationResponse>> create(@Valid @RequestBody DesignationRequest request) {
        DesignationResponse response = designationService.createDesignation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Designation created", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignationResponse>> update(
            @PathVariable Long id, @Valid @RequestBody DesignationRequest request) {
        DesignationResponse response = designationService.updateDesignation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Designation updated", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        designationService.deleteDesignation(id);
        return ResponseEntity.ok(ApiResponse.success("Designation deleted"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DesignationResponse>>> getAll(
            @RequestParam(required = false) Long departmentId) {
        List<DesignationResponse> response = departmentId != null
                ? designationService.getByDepartment(departmentId)
                : designationService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Designations fetched", response));
    }
}
