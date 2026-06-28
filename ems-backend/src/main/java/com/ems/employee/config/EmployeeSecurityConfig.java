package com.ems.employee.config;

import com.ems.employee.repository.EmployeeRepository;
import com.ems.security.CustomUserDetailsService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Wires the Employee module into the security layer at startup, implementing the
 * EmployeeIdLookup functional interface so JWTs/login responses can carry employeeId
 * without security/ needing a compile-time dependency on employee/.
 */
@Component
@RequiredArgsConstructor
public class EmployeeSecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final EmployeeRepository employeeRepository;

    @PostConstruct
    public void wireEmployeeIdLookup() {
        userDetailsService.setEmployeeIdLookup(
                userId -> employeeRepository.findByUserId(userId).map(e -> e.getId()));
    }
}
