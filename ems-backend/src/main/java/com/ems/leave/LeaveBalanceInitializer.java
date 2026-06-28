package com.ems.leave;

/**
 * Implemented by the leave module's service and wired into EmployeeService at startup
 * (mirrors the EmployeeIdLookup pattern used between security and employee).
 * Keeps employee/ from needing a compile-time dependency on leave/.
 */
public interface LeaveBalanceInitializer {
    void initializeForEmployee(Long employeeId);
}
