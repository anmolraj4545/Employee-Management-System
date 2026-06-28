package com.ems.payroll.controller;

import com.ems.common.ApiResponse;
import com.ems.common.PageResponse;
import com.ems.common.exception.BadRequestException;
import com.ems.payroll.dto.*;
import com.ems.payroll.service.PayrollService;
import com.ems.payroll.service.PayslipPdfService;
import com.ems.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Payroll", description = "Salary structures, payroll generation, payslips")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final PayslipPdfService payslipPdfService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PostMapping("/salary-structure")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> setSalaryStructure(
            @Valid @RequestBody SalaryStructureRequest request) {
        SalaryStructureResponse response = payrollService.createOrUpdateSalaryStructure(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Salary structure saved", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/salary-structure/{employeeId}")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> getSalaryStructure(@PathVariable Long employeeId) {
        SalaryStructureResponse response = payrollService.getSalaryStructure(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Salary structure fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<PayslipResponse>>> generatePayroll(
            @Valid @RequestBody GeneratePayrollRequest request) {
        List<PayslipResponse> response = payrollService.generatePayroll(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Generated " + response.size() + " payslip(s)", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @PutMapping("/payslips/{id}/mark-paid")
    public ResponseEntity<ApiResponse<PayslipResponse>> markPaid(@PathVariable Long id) {
        PayslipResponse response = payrollService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success("Payslip marked as paid", response));
    }

    @GetMapping("/payslips/me")
    public ResponseEntity<ApiResponse<List<PayslipResponse>>> myPayslips(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<PayslipResponse> response = payrollService.getOwnPayslips(requireEmployeeId(user));
        return ResponseEntity.ok(ApiResponse.success("Payslips fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/employee/{employeeId}/history")
    public ResponseEntity<ApiResponse<List<PayslipResponse>>> employeeHistory(@PathVariable Long employeeId) {
        List<PayslipResponse> response = payrollService.getOwnPayslips(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Payslip history fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<PageResponse<PayslipResponse>>> monthlyPayroll(
            @RequestParam int month, @RequestParam int year,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<PayslipResponse> response = PageResponse.from(payrollService.getMonthlyPayroll(month, year, pageable));
        return ResponseEntity.ok(ApiResponse.success("Monthly payroll fetched", response));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
    @GetMapping("/monthly/summary")
    public ResponseEntity<ApiResponse<PayrollSummary>> monthlySummary(
            @RequestParam int month, @RequestParam int year) {
        PayrollSummary response = payrollService.getMonthlySummary(month, year);
        return ResponseEntity.ok(ApiResponse.success("Monthly payroll summary fetched", response));
    }

    /** Self-service: download own payslip as PDF. */
    @GetMapping("/payslips/{id}/pdf")
    public ResponseEntity<byte[]> downloadPayslipPdf(
            @PathVariable Long id, @AuthenticationPrincipal CustomUserDetails user) {
        PayslipResponse payslip = payrollService.getPayslipById(id);

        boolean isOwner = user.getEmployeeId() != null && user.getEmployeeId().equals(payslip.getEmployeeId());
        boolean isAdmin = user.getRole().equals("SUPER_ADMIN") || user.getRole().equals("HR_MANAGER");
        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You do not have permission to view this payslip");
        }

        byte[] pdfBytes = payslipPdfService.generatePayslipPdf(payslip);
        String filename = "payslip-" + payslip.getEmployeeCode() + "-" + payslip.getPayMonth() + "-" + payslip.getPayYear() + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdfBytes);
    }

    private Long requireEmployeeId(CustomUserDetails user) {
        if (user.getEmployeeId() == null) {
            throw new BadRequestException("No employee profile is linked to this account");
        }
        return user.getEmployeeId();
    }
}
