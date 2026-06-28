package com.ems.employee.service;

import com.ems.common.enums.EmployeeStatus;
import com.ems.common.enums.RoleName;
import com.ems.common.exception.BadRequestException;
import com.ems.common.exception.ConflictException;
import com.ems.common.exception.ResourceNotFoundException;
import com.ems.department.entity.Department;
import com.ems.department.entity.Designation;
import com.ems.department.repository.DepartmentRepository;
import com.ems.department.repository.DesignationRepository;
import com.ems.employee.dto.EmployeeRequest;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.employee.dto.EmployeeSummary;
import com.ems.employee.entity.Employee;
import com.ems.employee.mapper.EmployeeMapper;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.leave.LeaveBalanceInitializer;
import com.ems.user.Role;
import com.ems.user.RoleRepository;
import com.ems.user.User;
import com.ems.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeMapper employeeMapper;

    /** Optional hook, wired by the leave module so a new employee's leave balances are seeded automatically. */
    private LeaveBalanceInitializer leaveBalanceInitializer;

    public void setLeaveBalanceInitializer(LeaveBalanceInitializer initializer) {
        this.leaveBalanceInitializer = initializer;
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An employee with this email already exists");
        }
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BadRequestException("Username is required to create the employee's login account");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Initial password is required to create the employee's login account");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username is already taken");
        }

        RoleName roleName = parseRole(request.getRole());
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not configured: " + roleName));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Employee employee = new Employee();
        employee.setUser(user);
        applyRequestToEntity(request, employee);
        employee.setEmployeeCode(generateEmployeeCode());

        employee = employeeRepository.save(employee);

        if (leaveBalanceInitializer != null) {
            leaveBalanceInitializer.initializeForEmployee(employee.getId());
        }

        log.info("Created employee {} ({})", employee.getEmployeeCode(), employee.getEmail());
        return employeeMapper.toResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", id));

        if (!employee.getEmail().equalsIgnoreCase(request.getEmail())
                && employeeRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An employee with this email already exists");
        }

        applyRequestToEntity(request, employee);
        employee = employeeRepository.save(employee);

        // Keep the linked user's email in sync, since it's used for login-by-email and password reset
        User user = employee.getUser();
        if (user != null && !user.getEmail().equalsIgnoreCase(request.getEmail())) {
            user.setEmail(request.getEmail());
            userRepository.save(user);
        }

        return employeeMapper.toResponse(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", id));

        // Soft delete: deactivate employee and disable login, never hard-delete HR records
        employee.setStatus(EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);

        if (employee.getUser() != null) {
            User user = employee.getUser();
            user.setEnabled(false);
            userRepository.save(user);
        }

        log.info("Soft-deleted (terminated) employee {}", employee.getEmployeeCode());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", id));
        return employeeMapper.toResponse(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeByUserId(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
        return employeeMapper.toResponse(employee);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeSummary> searchEmployees(String search, Long departmentId, EmployeeStatus status, Pageable pageable) {
        return employeeRepository.search(search, departmentId, status, pageable)
                .map(employeeMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public List<EmployeeSummary> getAllActiveForDropdown() {
        return employeeRepository.search(null, null, EmployeeStatus.ACTIVE, Pageable.unpaged())
                .map(employeeMapper::toSummary)
                .getContent();
    }

    @Transactional
    public EmployeeResponse updateProfilePhoto(Long id, String photoUrl) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", id));
        employee.setProfilePhotoUrl(photoUrl);
        employee = employeeRepository.save(employee);
        return employeeMapper.toResponse(employee);
    }

    // ---------- helpers ----------

    private void applyRequestToEntity(EmployeeRequest request, Employee employee) {
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setGender(request.getGender());
        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setAddress(request.getAddress());
        employee.setCity(request.getCity());
        employee.setState(request.getState());
        employee.setCountry(request.getCountry());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setSalary(request.getSalary());
        employee.setEmergencyContactName(request.getEmergencyContactName());
        employee.setEmergencyContactPhone(request.getEmergencyContactPhone());

        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Department", "id", request.getDepartmentId()));
            employee.setDepartment(department);
        } else {
            employee.setDepartment(null);
        }

        if (request.getDesignationId() != null) {
            Designation designation = designationRepository.findById(request.getDesignationId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Designation", "id", request.getDesignationId()));
            employee.setDesignation(designation);
        } else {
            employee.setDesignation(null);
        }

        if (request.getManagerId() != null) {
            if (employee.getId() != null && request.getManagerId().equals(employee.getId())) {
                throw new BadRequestException("An employee cannot be their own manager");
            }
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Manager (Employee)", "id", request.getManagerId()));
            employee.setManager(manager);
        } else {
            employee.setManager(null);
        }
    }

    private RoleName parseRole(String role) {
        if (role == null || role.isBlank()) {
            return RoleName.EMPLOYEE;
        }
        try {
            return RoleName.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role: " + role + ". Must be one of SUPER_ADMIN, HR_MANAGER, EMPLOYEE");
        }
    }

    /** Generates a human-readable code like EMP-2026-0001, sequential within the current year. */
    private synchronized String generateEmployeeCode() {
        int year = Year.now().getValue();
        long nextSeq = employeeRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("EMP-%d-%04d", year, nextSeq);
            nextSeq++;
        } while (employeeRepository.existsByEmployeeCode(candidate));
        return candidate;
    }
}
