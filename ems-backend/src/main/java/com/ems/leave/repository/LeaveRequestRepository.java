package com.ems.leave.repository;

import com.ems.common.enums.LeaveRequestStatus;
import com.ems.leave.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    Page<LeaveRequest> findByStatusOrderByCreatedAtAsc(LeaveRequestStatus status, Pageable pageable);

    long countByStatus(LeaveRequestStatus status);

    @Query("""
            SELECT CASE WHEN COUNT(lr) > 0 THEN true ELSE false END FROM LeaveRequest lr
            WHERE lr.employee.id = :employeeId
              AND lr.status IN :activeStatuses
              AND lr.startDate <= :endDate AND lr.endDate >= :startDate
            """)
    boolean hasOverlappingRequest(@Param("employeeId") Long employeeId,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate,
                                   @Param("activeStatuses") List<LeaveRequestStatus> activeStatuses);

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE (:employeeId IS NULL OR lr.employee.id = :employeeId)
              AND (:status IS NULL OR lr.status = :status)
            ORDER BY lr.createdAt DESC
            """)
    Page<LeaveRequest> search(@Param("employeeId") Long employeeId,
                               @Param("status") LeaveRequestStatus status,
                               Pageable pageable);

    @Query("""
            SELECT lr FROM LeaveRequest lr
            WHERE lr.status = :status
              AND lr.startDate <= :date AND lr.endDate >= :date
            """)
    List<LeaveRequest> findLeavesOnDateByStatus(@Param("date") LocalDate date, @Param("status") LeaveRequestStatus status);
}
