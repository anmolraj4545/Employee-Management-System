package com.ems.report.service;

import com.ems.attendance.dto.AttendanceResponse;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.leave.dto.LeaveRequestResponse;
import com.ems.payroll.dto.PayslipResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;

@Service
public class ExcelReportService {

    public byte[] generateEmployeeReport(List<EmployeeResponse> employees) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Employees");
            CellStyle headerStyle = headerStyle(workbook);

            String[] headers = {"Employee Code", "Full Name", "Email", "Phone", "Department",
                    "Designation", "Joining Date", "Status", "Salary"};
            writeHeader(sheet, headers, headerStyle);

            int rowIdx = 1;
            for (EmployeeResponse e : employees) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(nullSafe(e.getEmployeeCode()));
                row.createCell(1).setCellValue(nullSafe(e.getFullName()));
                row.createCell(2).setCellValue(nullSafe(e.getEmail()));
                row.createCell(3).setCellValue(nullSafe(e.getPhoneNumber()));
                row.createCell(4).setCellValue(nullSafe(e.getDepartmentName()));
                row.createCell(5).setCellValue(nullSafe(e.getDesignationTitle()));
                row.createCell(6).setCellValue(e.getJoiningDate() != null ? e.getJoiningDate().toString() : "");
                row.createCell(7).setCellValue(e.getStatus() != null ? e.getStatus().name() : "");
                row.createCell(8).setCellValue(e.getSalary() != null ? e.getSalary().doubleValue() : 0.0);
            }

            autoSizeColumns(sheet, headers.length);
            return toBytes(workbook);
        } catch (IOException ex) {
            throw new UncheckedIOException("Failed to generate employee Excel report", ex);
        }
    }

    public byte[] generateAttendanceReport(List<AttendanceResponse> records) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance");
            CellStyle headerStyle = headerStyle(workbook);

            String[] headers = {"Employee Code", "Employee Name", "Date", "Check In", "Check Out",
                    "Working Hours", "Status", "Late"};
            writeHeader(sheet, headers, headerStyle);

            int rowIdx = 1;
            for (AttendanceResponse a : records) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(nullSafe(a.getEmployeeCode()));
                row.createCell(1).setCellValue(nullSafe(a.getEmployeeName()));
                row.createCell(2).setCellValue(a.getAttendanceDate() != null ? a.getAttendanceDate().toString() : "");
                row.createCell(3).setCellValue(a.getCheckInTime() != null ? a.getCheckInTime().toString() : "");
                row.createCell(4).setCellValue(a.getCheckOutTime() != null ? a.getCheckOutTime().toString() : "");
                row.createCell(5).setCellValue(a.getWorkingHours() != null ? a.getWorkingHours().doubleValue() : 0.0);
                row.createCell(6).setCellValue(a.getStatus() != null ? a.getStatus().name() : "");
                row.createCell(7).setCellValue(a.isLate() ? "Yes" : "No");
            }

            autoSizeColumns(sheet, headers.length);
            return toBytes(workbook);
        } catch (IOException ex) {
            throw new UncheckedIOException("Failed to generate attendance Excel report", ex);
        }
    }

    public byte[] generatePayrollReport(List<PayslipResponse> payslips) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Payroll");
            CellStyle headerStyle = headerStyle(workbook);

            String[] headers = {"Employee Code", "Employee Name", "Department", "Month", "Year",
                    "Basic", "HRA", "Bonus", "PF Deduction", "Tax Deduction", "Gross", "Net", "Status"};
            writeHeader(sheet, headers, headerStyle);

            int rowIdx = 1;
            for (PayslipResponse p : payslips) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(nullSafe(p.getEmployeeCode()));
                row.createCell(1).setCellValue(nullSafe(p.getEmployeeName()));
                row.createCell(2).setCellValue(nullSafe(p.getDepartmentName()));
                row.createCell(3).setCellValue(p.getPayMonth());
                row.createCell(4).setCellValue(p.getPayYear());
                row.createCell(5).setCellValue(p.getBasicSalary() != null ? p.getBasicSalary().doubleValue() : 0.0);
                row.createCell(6).setCellValue(p.getHra() != null ? p.getHra().doubleValue() : 0.0);
                row.createCell(7).setCellValue(p.getBonus() != null ? p.getBonus().doubleValue() : 0.0);
                row.createCell(8).setCellValue(p.getPfDeduction() != null ? p.getPfDeduction().doubleValue() : 0.0);
                row.createCell(9).setCellValue(p.getTaxDeduction() != null ? p.getTaxDeduction().doubleValue() : 0.0);
                row.createCell(10).setCellValue(p.getGrossSalary() != null ? p.getGrossSalary().doubleValue() : 0.0);
                row.createCell(11).setCellValue(p.getNetSalary() != null ? p.getNetSalary().doubleValue() : 0.0);
                row.createCell(12).setCellValue(p.getStatus() != null ? p.getStatus().name() : "");
            }

            autoSizeColumns(sheet, headers.length);
            return toBytes(workbook);
        } catch (IOException ex) {
            throw new UncheckedIOException("Failed to generate payroll Excel report", ex);
        }
    }

    public byte[] generateLeaveReport(List<LeaveRequestResponse> requests) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Leave Requests");
            CellStyle headerStyle = headerStyle(workbook);

            String[] headers = {"Employee Code", "Employee Name", "Leave Type", "Start Date",
                    "End Date", "Total Days", "Status", "Approved By", "Reason"};
            writeHeader(sheet, headers, headerStyle);

            int rowIdx = 1;
            for (LeaveRequestResponse lr : requests) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(nullSafe(lr.getEmployeeCode()));
                row.createCell(1).setCellValue(nullSafe(lr.getEmployeeName()));
                row.createCell(2).setCellValue(nullSafe(lr.getLeaveTypeName()));
                row.createCell(3).setCellValue(lr.getStartDate() != null ? lr.getStartDate().toString() : "");
                row.createCell(4).setCellValue(lr.getEndDate() != null ? lr.getEndDate().toString() : "");
                row.createCell(5).setCellValue(lr.getTotalDays() != null ? lr.getTotalDays().doubleValue() : 0.0);
                row.createCell(6).setCellValue(lr.getStatus() != null ? lr.getStatus().name() : "");
                row.createCell(7).setCellValue(nullSafe(lr.getApprovedByName()));
                row.createCell(8).setCellValue(nullSafe(lr.getReason()));
            }

            autoSizeColumns(sheet, headers.length);
            return toBytes(workbook);
        } catch (IOException ex) {
            throw new UncheckedIOException("Failed to generate leave Excel report", ex);
        }
    }

    // ---------- helpers ----------

    private CellStyle headerStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE_GREY.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private void writeHeader(Sheet sheet, String[] headers, CellStyle style) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private void autoSizeColumns(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }

    private byte[] toBytes(Workbook workbook) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        return out.toByteArray();
    }
}
