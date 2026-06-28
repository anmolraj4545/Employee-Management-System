package com.ems.payroll.service;

import com.ems.payroll.dto.PayslipResponse;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

@Service
public class PayslipPdfService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(30, 41, 59));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(71, 85, 105));
    private static final Font LABEL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(100, 116, 139));
    private static final Font VALUE_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(15, 23, 42));
    private static final Font NET_FONT = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(16, 117, 79));

    public byte[] generatePayslipPdf(PayslipResponse payslip) {
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            String monthName = Month.of(payslip.getPayMonth()).getDisplayName(TextStyle.FULL, Locale.ENGLISH);

            Paragraph title = new Paragraph("Payslip — " + monthName + " " + payslip.getPayYear(), TITLE_FONT);
            title.setSpacingAfter(20);
            document.add(title);

            // Employee details table
            PdfPTable empTable = new PdfPTable(2);
            empTable.setWidthPercentage(100);
            empTable.setSpacingAfter(20);
            addRow(empTable, "Employee Name", payslip.getEmployeeName());
            addRow(empTable, "Employee Code", payslip.getEmployeeCode());
            addRow(empTable, "Department", payslip.getDepartmentName() != null ? payslip.getDepartmentName() : "-");
            addRow(empTable, "Pay Period", monthName + " " + payslip.getPayYear());
            document.add(empTable);

            // Earnings / deductions table
            PdfPTable salaryTable = new PdfPTable(2);
            salaryTable.setWidthPercentage(100);
            salaryTable.setSpacingAfter(15);

            PdfPCell earningsHeader = headerCell("Earnings");
            PdfPCell deductionsHeader = headerCell("Deductions");
            salaryTable.addCell(earningsHeader);
            salaryTable.addCell(deductionsHeader);

            addLineItem(salaryTable, "Basic Salary", payslip.getBasicSalary(), "PF Deduction", payslip.getPfDeduction());
            addLineItem(salaryTable, "HRA", payslip.getHra(), "Tax Deduction", payslip.getTaxDeduction());
            addLineItem(salaryTable, "Bonus", payslip.getBonus(), "Other Deductions", payslip.getOtherDeductions());
            addLineItem(salaryTable, "Incentive", payslip.getIncentive(), "", null);

            document.add(salaryTable);

            // Totals
            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(100);
            totalsTable.setSpacingAfter(20);
            addRow(totalsTable, "Gross Salary", formatCurrency(payslip.getGrossSalary()));
            document.add(totalsTable);

            Paragraph net = new Paragraph(
                    "Net Salary: " + formatCurrency(payslip.getNetSalary()), NET_FONT);
            document.add(net);

            Paragraph footer = new Paragraph(
                    "\n\nThis is a system-generated payslip and does not require a signature.",
                    new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY));
            document.add(footer);

        } catch (DocumentException ex) {
            throw new RuntimeException("Failed to generate payslip PDF", ex);
        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    private void addRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, LABEL_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(6);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "-", VALUE_FONT));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(6);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private PdfPCell headerCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEADER_FONT));
        cell.setBackgroundColor(new Color(241, 245, 249));
        cell.setPadding(8);
        return cell;
    }

    private void addLineItem(PdfPTable table, String earnLabel, java.math.BigDecimal earnValue,
                              String dedLabel, java.math.BigDecimal dedValue) {
        PdfPCell earnCell = new PdfPCell(new Phrase(
                earnValue != null ? earnLabel + ": " + formatCurrency(earnValue) : "", VALUE_FONT));
        earnCell.setPadding(6);
        earnCell.setBorder(Rectangle.BOTTOM);
        earnCell.setBorderColor(new Color(226, 232, 240));

        PdfPCell dedCell = new PdfPCell(new Phrase(
                dedValue != null ? dedLabel + ": " + formatCurrency(dedValue) : "", VALUE_FONT));
        dedCell.setPadding(6);
        dedCell.setBorder(Rectangle.BOTTOM);
        dedCell.setBorderColor(new Color(226, 232, 240));

        table.addCell(earnCell);
        table.addCell(dedCell);
    }

    private String formatCurrency(java.math.BigDecimal amount) {
        if (amount == null) return "-";
        return String.format(Locale.US, "%,.2f", amount);
    }
}
