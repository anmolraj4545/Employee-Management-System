package com.ems.leave.controller;

import com.ems.common.ApiResponse;
import com.ems.common.PageResponse;
import com.ems.common.enums.LeaveRequestStatus;
import com.ems.common.exception.BadRequestException;
import com.ems.leave.dto.LeaveApplyRequest;
import com.ems.leave.dto.LeaveBalanceResponse;
import com.ems.leave.dto.LeaveRejectRequest;
import com.ems.leave.dto.LeaveRequestResponse;
import com.ems.leave.service.LeaveService;
import com.ems.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Leave", description = "Apply, approve, reject, cancel leave requests and check balances")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> apply(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody LeaveApplyRequest request) {
        LeaveRequestResponse response = leaveService.applyLeave(requireEmployeeId(user), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Leave request submitted", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> approve(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails user) {
        LeaveRequestResponse response = leaveService.approveLeave(id, requireEmployeeId(user));
        return ResponseEntity.ok(ApiResponse.success("Leave request approved", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody LeaveRejectRequest request) {
        LeaveRequestResponse response = leaveService.rejectLeave(id, requireEmployeeId(user), request.getRejectionReason());
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancel(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails user) {
        LeaveRequestResponse response = leaveService.cancelLeave(id, requireEmployeeId(user));
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<LeaveRequestResponse>>> myRequests(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<LeaveRequestResponse> response = leaveService.getOwnRequests(requireEmployeeId(user));
        return ResponseEntity.ok(ApiResponse.success("Leave requests fetched", response));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> myBalance(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) Integer year) {
        List<LeaveBalanceResponse> response = leaveService.getBalances(requireEmployeeId(user), year);
        return ResponseEntity.ok(ApiResponse.success("Leave balance fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/employee/{employeeId}/balance")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> employeeBalance(
            @PathVariable Long employeeId, @RequestParam(required = false) Integer year) {
        List<LeaveBalanceResponse> response = leaveService.getBalances(employeeId, year);
        return ResponseEntity.ok(ApiResponse.success("Leave balance fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PageResponse<LeaveRequestResponse>>> pending(
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<LeaveRequestResponse> response = PageResponse.from(leaveService.getPending(pageable));
        return ResponseEntity.ok(ApiResponse.success("Pending leave requests fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<LeaveRequestResponse>>> search(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) LeaveRequestStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<LeaveRequestResponse> response =
                PageResponse.from(leaveService.search(employeeId, status, pageable));
        return ResponseEntity.ok(ApiResponse.success("Leave requests fetched", response));
    }

    private Long requireEmployeeId(CustomUserDetails user) {
        if (user.getEmployeeId() == null) {
            throw new BadRequestException("No employee profile is linked to this account");
        }
        return user.getEmployeeId();
    }
}
