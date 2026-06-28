package com.ems.leave.repository;

import com.ems.leave.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYear(Long employeeId, Long leaveTypeId, int year);

    List<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, int year);

    boolean existsByEmployeeIdAndYear(Long employeeId, int year);
}
