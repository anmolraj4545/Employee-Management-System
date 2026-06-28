package com.ems.leave.config;

import com.ems.employee.service.EmployeeService;
import com.ems.leave.service.LeaveService;
import com.ems.notification.service.NotificationService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Wires the Leave module into the Employee and Notification modules at startup, mirroring the
 * EmployeeSecurityConfig pattern used between security/ and employee/.
 */
@Component
@RequiredArgsConstructor
public class LeaveSecurityConfig {

    private final EmployeeService employeeService;
    private final LeaveService leaveService;
    private final NotificationService notificationService;

    @PostConstruct
    public void wireLeaveBalanceInitializer() {
        employeeService.setLeaveBalanceInitializer(leaveService);
        leaveService.setNotificationPublisher(notificationService);
    }
}
