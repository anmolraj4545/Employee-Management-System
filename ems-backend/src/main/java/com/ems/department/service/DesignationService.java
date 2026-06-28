package com.ems.department.service;

import com.ems.common.exception.ResourceNotFoundException;
import com.ems.department.dto.DesignationRequest;
import com.ems.department.dto.DesignationResponse;
import com.ems.department.entity.Department;
import com.ems.department.entity.Designation;
import com.ems.department.repository.DepartmentRepository;
import com.ems.department.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignationService {

    private final DesignationRepository designationRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public DesignationResponse createDesignation(DesignationRequest request) {
        Designation designation = new Designation();
        designation.setTitle(request.getTitle());
        applyDepartment(request, designation);
        designation = designationRepository.save(designation);
        return toResponse(designation);
    }

    @Transactional
    public DesignationResponse updateDesignation(Long id, DesignationRequest request) {
        Designation designation = designationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Designation", "id", id));
        designation.setTitle(request.getTitle());
        applyDepartment(request, designation);
        designation = designationRepository.save(designation);
        return toResponse(designation);
    }

    @Transactional
    public void deleteDesignation(Long id) {
        if (!designationRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Designation", "id", id);
        }
        designationRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DesignationResponse> getAll() {
        return designationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DesignationResponse> getByDepartment(Long departmentId) {
        return designationRepository.findByDepartmentId(departmentId).stream().map(this::toResponse).toList();
    }

    private void applyDepartment(DesignationRequest request, Designation designation) {
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Department", "id", request.getDepartmentId()));
            designation.setDepartment(department);
        } else {
            designation.setDepartment(null);
        }
    }

    private DesignationResponse toResponse(Designation d) {
        Department dept = d.getDepartment();
        return DesignationResponse.builder()
                .id(d.getId())
                .title(d.getTitle())
                .departmentId(dept != null ? dept.getId() : null)
                .departmentName(dept != null ? dept.getName() : null)
                .build();
    }
}
