package com.ems.report.controller;

import com.ems.attendance.dto.AttendanceResponse;
import com.ems.attendance.service.AttendanceService;
import com.ems.common.enums.AttendanceStatus;
import com.ems.common.enums.LeaveRequestStatus;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.employee.dto.EmployeeSummary;
import com.ems.employee.service.EmployeeService;
import com.ems.leave.dto.LeaveRequestResponse;
import com.ems.leave.service.LeaveService;
import com.ems.payroll.dto.PayslipResponse;
import com.ems.payroll.service.PayrollService;
import com.ems.report.service.ExcelReportService;
import com.ems.report.service.ReportPdfService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Reports", description = "Excel and PDF export for employees, attendance, payroll, and leave")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_MANAGER')")
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final EmployeeService employeeService;
    private final AttendanceService attendanceService;
    private final PayrollService payrollService;
    private final LeaveService leaveService;
    private final ExcelReportService excelReportService;
    private final ReportPdfService reportPdfService;

    @GetMapping("/employees")
    public ResponseEntity<byte[]> employeeReport(@RequestParam(defaultValue = "excel") String format) {
        List<EmployeeResponse> employees = employeeService
                .searchEmployees(null, null, null, Pageable.unpaged())
                .map(EmployeeSummary::getId)
                .map(employeeService::getEmployeeById)
                .getContent();

        if ("pdf".equalsIgnoreCase(format)) {
            byte[] pdf = reportPdfService.generateEmployeeReportPdf(employees);
            return fileResponse(pdf, "employee-report.pdf", MediaType.APPLICATION_PDF);
        }

        byte[] excel = excelReportService.generateEmployeeReport(employees);
        return fileResponse(excel, "employee-report.xlsx", excelMediaType());
    }

    @GetMapping("/attendance")
    public ResponseEntity<byte[]> attendanceReport(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end,
            @RequestParam(required = false) AttendanceStatus status) {

        List<AttendanceResponse> records = attendanceService
                .search(employeeId, departmentId, start, end, status, Pageable.unpaged())
                .getContent();

        byte[] excel = excelReportService.generateAttendanceReport(records);
        return fileResponse(excel, "attendance-report.xlsx", excelMediaType());
    }

    @GetMapping("/payroll")
    public ResponseEntity<byte[]> payrollReport(@RequestParam int month, @RequestParam int year) {
        List<PayslipResponse> payslips = payrollService
                .getMonthlyPayroll(month, year, Pageable.unpaged())
                .getContent();

        byte[] excel = excelReportService.generatePayrollReport(payslips);
        return fileResponse(excel, "payroll-report-" + month + "-" + year + ".xlsx", excelMediaType());
    }

    @GetMapping("/leave")
    public ResponseEntity<byte[]> leaveReport(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) LeaveRequestStatus status) {

        List<LeaveRequestResponse> requests = leaveService
                .search(employeeId, status, Pageable.unpaged())
                .getContent();

        byte[] excel = excelReportService.generateLeaveReport(requests);
        return fileResponse(excel, "leave-report.xlsx", excelMediaType());
    }

    // ---------- helpers ----------

    private MediaType excelMediaType() {
        return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    private ResponseEntity<byte[]> fileResponse(byte[] content, String filename, MediaType mediaType) {
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(content);
    }
}
