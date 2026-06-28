package com.ems.leave.service;

import com.ems.common.enums.LeaveRequestStatus;
import com.ems.common.exception.BadRequestException;
import com.ems.common.exception.ResourceNotFoundException;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.leave.LeaveBalanceInitializer;
import com.ems.leave.dto.LeaveApplyRequest;
import com.ems.leave.dto.LeaveBalanceResponse;
import com.ems.leave.dto.LeaveRequestResponse;
import com.ems.leave.entity.LeaveBalance;
import com.ems.leave.entity.LeaveRequest;
import com.ems.leave.entity.LeaveType;
import com.ems.leave.repository.LeaveBalanceRepository;
import com.ems.leave.repository.LeaveRequestRepository;
import com.ems.leave.repository.LeaveTypeRepository;
import com.ems.notification.NotificationPublisher;
import com.ems.common.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveService implements LeaveBalanceInitializer {

    private static final List<LeaveRequestStatus> ACTIVE_STATUSES =
            List.of(LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED);

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;

    /** Optional, wired at startup by NotificationWiringConfig once the notification module exists. */
    private NotificationPublisher notificationPublisher;

    public void setNotificationPublisher(NotificationPublisher notificationPublisher) {
        this.notificationPublisher = notificationPublisher;
    }

    @Transactional
    public LeaveRequestResponse applyLeave(Long employeeId, LeaveApplyRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", employeeId));

        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> ResourceNotFoundException.of("Leave type", "id", request.getLeaveTypeId()));

        if (leaveRequestRepository.hasOverlappingRequest(
                employeeId, request.getStartDate(), request.getEndDate(), ACTIVE_STATUSES)) {
            throw new BadRequestException("You already have a pending or approved leave request overlapping these dates");
        }

        BigDecimal totalDays = BigDecimal.valueOf(
                ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1);

        int year = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveType.getId(), year)
                .orElseThrow(() -> new BadRequestException(
                        "No leave balance found for " + leaveType.getName() + " in " + year));

        if (balance.getRemainingDays().compareTo(totalDays) < 0) {
            throw new BadRequestException(
                    "Insufficient leave balance. Remaining: " + balance.getRemainingDays() + " day(s)");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(LeaveRequestStatus.PENDING)
                .build();

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return toResponse(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponse approveLeave(Long leaveRequestId, Long approverEmployeeId) {
        LeaveRequest leaveRequest = getPendingOrThrow(leaveRequestId);

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", approverEmployeeId));

        // Deduct from balance now that it's approved
        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(
                        leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId(), year)
                .orElseThrow(() -> new BadRequestException("Leave balance record missing; cannot approve"));

        if (balance.getRemainingDays().compareTo(leaveRequest.getTotalDays()) < 0) {
            throw new BadRequestException("Employee's leave balance is insufficient to approve this request");
        }

        balance.setUsedDays(balance.getUsedDays().add(leaveRequest.getTotalDays()));
        leaveBalanceRepository.save(balance);

        leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setApprovedAt(LocalDateTime.now());
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        notifyEmployee(leaveRequest.getEmployee(),
                "Leave Approved",
                "Your " + leaveRequest.getLeaveType().getName() + " leave request ("
                        + leaveRequest.getStartDate() + " to " + leaveRequest.getEndDate() + ") was approved.",
                NotificationType.LEAVE_APPROVAL);

        return toResponse(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponse rejectLeave(Long leaveRequestId, Long approverEmployeeId, String rejectionReason) {
        LeaveRequest leaveRequest = getPendingOrThrow(leaveRequestId);

        Employee approver = employeeRepository.findById(approverEmployeeId)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", approverEmployeeId));

        leaveRequest.setStatus(LeaveRequestStatus.REJECTED);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setApprovedAt(LocalDateTime.now());
        leaveRequest.setRejectionReason(rejectionReason);
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        notifyEmployee(leaveRequest.getEmployee(),
                "Leave Rejected",
                "Your " + leaveRequest.getLeaveType().getName() + " leave request was rejected. Reason: " + rejectionReason,
                NotificationType.LEAVE_APPROVAL);

        return toResponse(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponse cancelLeave(Long leaveRequestId, Long employeeId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> ResourceNotFoundException.of("Leave request", "id", leaveRequestId));

        if (!leaveRequest.getEmployee().getId().equals(employeeId)) {
            throw new BadRequestException("You can only cancel your own leave requests");
        }
        if (leaveRequest.getStatus() == LeaveRequestStatus.CANCELLED
                || leaveRequest.getStatus() == LeaveRequestStatus.REJECTED) {
            throw new BadRequestException("This leave request cannot be cancelled");
        }

        // If it was already approved, restore the balance
        if (leaveRequest.getStatus() == LeaveRequestStatus.APPROVED) {
            int year = leaveRequest.getStartDate().getYear();
            LeaveRequest finalLeaveRequest = leaveRequest;
            leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveRequest.getLeaveType().getId(), year)
                    .ifPresent(balance -> {
                        balance.setUsedDays(balance.getUsedDays().subtract(finalLeaveRequest.getTotalDays()));
                        leaveBalanceRepository.save(balance);
                    });
        }

        leaveRequest.setStatus(LeaveRequestStatus.CANCELLED);
        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return toResponse(leaveRequest);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getOwnRequests(Long employeeId) {
        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestResponse> search(Long employeeId, LeaveRequestStatus status, Pageable pageable) {
        return leaveRequestRepository.search(employeeId, status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<LeaveRequestResponse> getPending(Pageable pageable) {
        return leaveRequestRepository.findByStatusOrderByCreatedAtAsc(LeaveRequestStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getBalances(Long employeeId, Integer year) {
        int effectiveYear = year != null ? year : Year.now().getValue();
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, effectiveYear).stream()
                .map(this::toBalanceResponse)
                .toList();
    }

    /** Called by EmployeeService.createEmployee() via the LeaveBalanceInitializer interface. */
    @Override
    @Transactional
    public void initializeForEmployee(Long employeeId) {
        int year = Year.now().getValue();
        if (leaveBalanceRepository.existsByEmployeeIdAndYear(employeeId, year)) {
            return;
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", employeeId));

        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
        for (LeaveType type : leaveTypes) {
            LeaveBalance balance = LeaveBalance.builder()
                    .employee(employee)
                    .leaveType(type)
                    .year(year)
                    .totalDays(BigDecimal.valueOf(type.getDefaultAnnualDays()))
                    .usedDays(BigDecimal.ZERO)
                    .build();
            leaveBalanceRepository.save(balance);
        }
        log.info("Initialized {} leave balance(s) for employee {}", leaveTypes.size(), employeeId);
    }

    // ---------- helpers ----------

    private LeaveRequest getPendingOrThrow(Long leaveRequestId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> ResourceNotFoundException.of("Leave request", "id", leaveRequestId));
        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be approved or rejected");
        }
        return leaveRequest;
    }

    private void notifyEmployee(Employee employee, String title, String message, NotificationType type) {
        if (notificationPublisher == null || employee.getUser() == null) {
            return;
        }
        notificationPublisher.notifyUser(employee.getUser().getId(), title, message, type);
    }

    private LeaveRequestResponse toResponse(LeaveRequest lr) {
        Employee e = lr.getEmployee();
        Employee approver = lr.getApprovedBy();
        return LeaveRequestResponse.builder()
                .id(lr.getId())
                .employeeId(e.getId())
                .employeeName(e.getFullName())
                .employeeCode(e.getEmployeeCode())
                .leaveTypeId(lr.getLeaveType().getId())
                .leaveTypeName(lr.getLeaveType().getName())
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .totalDays(lr.getTotalDays())
                .reason(lr.getReason())
                .status(lr.getStatus())
                .approvedByName(approver != null ? approver.getFullName() : null)
                .approvedAt(lr.getApprovedAt())
                .rejectionReason(lr.getRejectionReason())
                .createdAt(lr.getCreatedAt())
                .build();
    }

    private LeaveBalanceResponse toBalanceResponse(LeaveBalance b) {
        return LeaveBalanceResponse.builder()
                .leaveTypeId(b.getLeaveType().getId())
                .leaveTypeName(b.getLeaveType().getName())
                .year(b.getYear())
                .totalDays(b.getTotalDays())
                .usedDays(b.getUsedDays())
                .remainingDays(b.getRemainingDays())
                .build();
    }
}
