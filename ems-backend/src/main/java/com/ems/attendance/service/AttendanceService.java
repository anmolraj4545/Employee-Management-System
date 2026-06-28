package com.ems.attendance.service;

import com.ems.attendance.dto.AttendanceResponse;
import com.ems.attendance.dto.AttendanceSummary;
import com.ems.attendance.dto.AttendanceUpdateRequest;
import com.ems.attendance.entity.Attendance;
import com.ems.attendance.repository.AttendanceRepository;
import com.ems.common.enums.AttendanceStatus;
import com.ems.common.enums.EmployeeStatus;
import com.ems.common.exception.BadRequestException;
import com.ems.common.exception.ResourceNotFoundException;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.holiday.service.HolidayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final HolidayService holidayService;

    @Value("${app.attendance.work-start-time}")
    private String workStartTimeConfig;

    @Value("${app.attendance.late-grace-minutes}")
    private int lateGraceMinutes;

    @Transactional
    public AttendanceResponse checkIn(Long employeeId) {
        Employee employee = getEmployeeOrThrow(employeeId);
        LocalDate today = LocalDate.now();

        if (holidayService.isHoliday(today)) {
            throw new BadRequestException("Today is a company holiday. Check-in is not required.");
        }

        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElse(null);

        if (attendance != null && attendance.getCheckInTime() != null) {
            throw new BadRequestException("You have already checked in today");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean isLate = isLateCheckIn(now);

        if (attendance == null) {
            attendance = Attendance.builder()
                    .employee(employee)
                    .attendanceDate(today)
                    .checkInTime(now)
                    .status(AttendanceStatus.PRESENT)
                    .late(isLate)
                    .build();
        } else {
            attendance.setCheckInTime(now);
            attendance.setStatus(AttendanceStatus.PRESENT);
            attendance.setLate(isLate);
        }

        attendance = attendanceRepository.save(attendance);
        return toResponse(attendance);
    }

    @Transactional
    public AttendanceResponse checkOut(Long employeeId) {
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElseThrow(() -> new BadRequestException("You have not checked in today"));

        if (attendance.getCheckInTime() == null) {
            throw new BadRequestException("You have not checked in today");
        }
        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("You have already checked out today");
        }

        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOutTime(now);
        attendance.setWorkingHours(calculateWorkingHours(attendance.getCheckInTime(), now));

        // Mark half-day if worked less than 4 hours
        if (attendance.getWorkingHours().compareTo(BigDecimal.valueOf(4)) < 0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        attendance = attendanceRepository.save(attendance);
        return toResponse(attendance);
    }

    @Transactional
    public AttendanceResponse manualUpdate(Long attendanceId, AttendanceUpdateRequest request) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> ResourceNotFoundException.of("Attendance record", "id", attendanceId));

        attendance.setStatus(request.getStatus());
        if (request.getCheckInTime() != null) {
            attendance.setCheckInTime(request.getCheckInTime());
        }
        if (request.getCheckOutTime() != null) {
            attendance.setCheckOutTime(request.getCheckOutTime());
        }
        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            attendance.setWorkingHours(calculateWorkingHours(attendance.getCheckInTime(), attendance.getCheckOutTime()));
        }
        attendance.setRemarks(request.getRemarks());

        attendance = attendanceRepository.save(attendance);
        return toResponse(attendance);
    }

    @Transactional(readOnly = true)
    public java.util.List<AttendanceResponse> getOwnHistory(Long employeeId, LocalDate start, LocalDate end) {
        LocalDate effectiveStart = start != null ? start : LocalDate.now().withDayOfMonth(1);
        LocalDate effectiveEnd = end != null ? end : LocalDate.now();
        return attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(employeeId, effectiveStart, effectiveEnd)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> search(Long employeeId, Long departmentId, LocalDate start, LocalDate end,
                                            AttendanceStatus status, Pageable pageable) {
        return attendanceRepository.search(employeeId, departmentId, start, end, status, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AttendanceSummary getTodaySummary() {
        LocalDate today = LocalDate.now();
        long totalEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long present = attendanceRepository.countDistinctEmployeesByDateAndStatus(today, AttendanceStatus.PRESENT);
        long onLeave = attendanceRepository.countDistinctEmployeesByDateAndStatus(today, AttendanceStatus.LEAVE);
        long late = attendanceRepository.countByAttendanceDateAndLateTrue(today);
        long absent = Math.max(0, totalEmployees - present - onLeave);

        return AttendanceSummary.builder()
                .date(today)
                .totalEmployees(totalEmployees)
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .onLeaveCount(onLeave)
                .build();
    }

    // ---------- helpers ----------

    private Employee getEmployeeOrThrow(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", employeeId));
    }

    private boolean isLateCheckIn(LocalDateTime checkInTime) {
        LocalTime workStart = LocalTime.parse(workStartTimeConfig);
        LocalTime graceDeadline = workStart.plusMinutes(lateGraceMinutes);
        return checkInTime.toLocalTime().isAfter(graceDeadline);
    }

    private BigDecimal calculateWorkingHours(LocalDateTime checkIn, LocalDateTime checkOut) {
        Duration duration = Duration.between(checkIn, checkOut);
        double hours = duration.toMinutes() / 60.0;
        return BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP);
    }

    private AttendanceResponse toResponse(Attendance a) {
        Employee e = a.getEmployee();
        return AttendanceResponse.builder()
                .id(a.getId())
                .employeeId(e.getId())
                .employeeName(e.getFullName())
                .employeeCode(e.getEmployeeCode())
                .attendanceDate(a.getAttendanceDate())
                .checkInTime(a.getCheckInTime())
                .checkOutTime(a.getCheckOutTime())
                .workingHours(a.getWorkingHours())
                .status(a.getStatus())
                .late(a.isLate())
                .remarks(a.getRemarks())
                .build();
    }
}
