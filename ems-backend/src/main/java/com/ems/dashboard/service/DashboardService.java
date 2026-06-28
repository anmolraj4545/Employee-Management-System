package com.ems.dashboard.service;

import com.ems.attendance.repository.AttendanceRepository;
import com.ems.common.enums.AttendanceStatus;
import com.ems.common.enums.EmployeeStatus;
import com.ems.common.enums.LeaveRequestStatus;
import com.ems.dashboard.dto.AttendanceTrendPoint;
import com.ems.dashboard.dto.ChartDataPoint;
import com.ems.dashboard.dto.DashboardSummary;
import com.ems.department.repository.DepartmentRepository;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.leave.repository.LeaveRequestRepository;
import com.ems.payroll.repository.PayslipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayslipRepository payslipRepository;

    @Transactional(readOnly = true)
    public DashboardSummary getSummary() {
        LocalDate today = LocalDate.now();
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long presentToday = attendanceRepository.countDistinctEmployeesByDateAndStatus(today, AttendanceStatus.PRESENT);
        long lateToday = attendanceRepository.countByAttendanceDateAndLateTrue(today);
        long onLeaveToday = attendanceRepository.countDistinctEmployeesByDateAndStatus(today, AttendanceStatus.LEAVE);
        long absentToday = Math.max(0, activeEmployees - presentToday - onLeaveToday);
        long totalDepartments = departmentRepository.count();
        long pendingLeaves = leaveRequestRepository.countByStatus(LeaveRequestStatus.PENDING);

        YearMonth currentMonth = YearMonth.now();
        BigDecimal currentMonthPayroll = payslipRepository
                .findByPayMonthAndPayYear(currentMonth.getMonthValue(), currentMonth.getYear(), Pageable.unpaged())
                .getContent().stream()
                .map(p -> p.getNetSalary())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardSummary.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .presentToday(presentToday)
                .absentToday(absentToday)
                .lateToday(lateToday)
                .totalDepartments(totalDepartments)
                .pendingLeaveRequests(pendingLeaves)
                .currentMonthPayroll(currentMonthPayroll)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendanceTrendPoint> getAttendanceTrend(int days) {
        List<AttendanceTrendPoint> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long present = attendanceRepository.countDistinctEmployeesByDateAndStatus(date, AttendanceStatus.PRESENT);
            long onLeave = attendanceRepository.countDistinctEmployeesByDateAndStatus(date, AttendanceStatus.LEAVE);
            long late = attendanceRepository.countByAttendanceDateAndLateTrue(date);
            long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
            long absent = Math.max(0, activeEmployees - present - onLeave);

            trend.add(AttendanceTrendPoint.builder()
                    .date(date)
                    .presentCount(present)
                    .absentCount(absent)
                    .lateCount(late)
                    .build());
        }
        return trend;
    }

    @Transactional(readOnly = true)
    public List<ChartDataPoint> getDepartmentDistribution() {
        List<Object[]> rows = employeeRepository.countActiveEmployeesByDepartment(EmployeeStatus.ACTIVE);
        List<ChartDataPoint> points = new ArrayList<>();
        for (Object[] row : rows) {
            points.add(ChartDataPoint.builder()
                    .label((String) row[0])
                    .value((Long) row[1])
                    .build());
        }
        return points;
    }
}
