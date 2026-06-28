package com.ems.department.service;

import com.ems.common.enums.EmployeeStatus;
import com.ems.common.exception.BadRequestException;
import com.ems.common.exception.ConflictException;
import com.ems.common.exception.ResourceNotFoundException;
import com.ems.department.dto.DepartmentAnalytics;
import com.ems.department.dto.DepartmentRequest;
import com.ems.department.dto.DepartmentResponse;
import com.ems.department.entity.Department;
import com.ems.department.repository.DepartmentRepository;
import com.ems.employee.dto.EmployeeSummary;
import com.ems.employee.entity.Employee;
import com.ems.employee.mapper.EmployeeMapper;
import com.ems.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("A department with this name already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(true)
                .build();

        if (request.getHeadEmployeeId() != null) {
            Employee head = employeeRepository.findById(request.getHeadEmployeeId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", request.getHeadEmployeeId()));
            department.setHead(head);
        }

        department = departmentRepository.save(department);
        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Department", "id", id));

        if (!department.getName().equalsIgnoreCase(request.getName())
                && departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("A department with this name already exists");
        }

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        if (request.getHeadEmployeeId() != null) {
            Employee head = employeeRepository.findById(request.getHeadEmployeeId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", request.getHeadEmployeeId()));
            department.setHead(head);
        } else {
            department.setHead(null);
        }

        department = departmentRepository.save(department);
        return toResponse(department);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Department", "id", id));

        long employeeCount = employeeRepository.countByDepartmentId(id);
        if (employeeCount > 0) {
            throw new BadRequestException(
                    "Cannot delete a department with " + employeeCount + " assigned employee(s). Reassign them first.");
        }

        department.setActive(false);
        departmentRepository.save(department);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Department", "id", id));
        return toResponse(department);
    }

    @Transactional(readOnly = true)
    public List<EmployeeSummary> getDepartmentEmployees(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw ResourceNotFoundException.of("Department", "id", departmentId);
        }
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(employeeMapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentAnalytics getDepartmentAnalytics(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Department", "id", departmentId));

        List<Employee> employees = employeeRepository.findByDepartmentId(departmentId);
        long total = employees.size();
        long active = employees.stream().filter(e -> e.getStatus() == EmployeeStatus.ACTIVE).count();

        BigDecimal totalSalary = employees.stream()
                .map(Employee::getSalary)
                .filter(s -> s != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgSalary = total > 0
                ? totalSalary.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return DepartmentAnalytics.builder()
                .departmentId(department.getId())
                .departmentName(department.getName())
                .totalEmployees(total)
                .activeEmployees(active)
                .totalMonthlySalary(totalSalary)
                .averageSalary(avgSalary)
                .build();
    }

    private DepartmentResponse toResponse(Department department) {
        long employeeCount = employeeRepository.countByDepartmentId(department.getId());
        Employee head = department.getHead();
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .headEmployeeId(head != null ? head.getId() : null)
                .headEmployeeName(head != null ? head.getFullName() : null)
                .active(department.isActive())
                .employeeCount(employeeCount)
                .build();
    }
}
