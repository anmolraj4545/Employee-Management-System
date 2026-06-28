package com.ems.attendance.repository;

import com.ems.attendance.entity.Attendance;
import com.ems.common.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
            Long employeeId, LocalDate start, LocalDate end);

    Page<Attendance> findByAttendanceDate(LocalDate date, Pageable pageable);

    long countByAttendanceDateAndStatus(LocalDate date, AttendanceStatus status);

    long countByAttendanceDateAndLateTrue(LocalDate date);

    @Query("""
            SELECT a FROM Attendance a
            WHERE (:employeeId IS NULL OR a.employee.id = :employeeId)
              AND (:departmentId IS NULL OR a.employee.department.id = :departmentId)
              AND (:startDate IS NULL OR a.attendanceDate >= :startDate)
              AND (:endDate IS NULL OR a.attendanceDate <= :endDate)
              AND (:status IS NULL OR a.status = :status)
            ORDER BY a.attendanceDate DESC
            """)
    Page<Attendance> search(
            @Param("employeeId") Long employeeId,
            @Param("departmentId") Long departmentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") AttendanceStatus status,
            Pageable pageable);

    @Query("SELECT COUNT(DISTINCT a.employee.id) FROM Attendance a WHERE a.attendanceDate = :date AND a.status = :status")
    long countDistinctEmployeesByDateAndStatus(@Param("date") LocalDate date, @Param("status") AttendanceStatus status);
}
