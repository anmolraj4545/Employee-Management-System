package com.ems.report.service;

import com.ems.employee.dto.EmployeeResponse;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ReportPdfService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 16, Font.BOLD, new Color(30, 41, 59));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font CELL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(30, 41, 59));

    public byte[] generateEmployeeReportPdf(List<EmployeeResponse> employees) {
        Document document = new Document(PageSize.A4.rotate(), 30, 30, 30, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Employee Report", TITLE_FONT);
            title.setSpacingAfter(15);
            document.add(title);

            String[] headers = {"Code", "Name", "Email", "Department", "Designation", "Joining Date", "Status"};
            PdfPTable table = new PdfPTable(headers.length);
            table.setWidthPercentage(100);

            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, HEADER_FONT));
                cell.setBackgroundColor(new Color(51, 65, 85));
                cell.setPadding(6);
                table.addCell(cell);
            }

            for (EmployeeResponse e : employees) {
                addCell(table, e.getEmployeeCode());
                addCell(table, e.getFullName());
                addCell(table, e.getEmail());
                addCell(table, e.getDepartmentName());
                addCell(table, e.getDesignationTitle());
                addCell(table, e.getJoiningDate() != null ? e.getJoiningDate().toString() : "");
                addCell(table, e.getStatus() != null ? e.getStatus().name() : "");
            }

            document.add(table);
        } catch (DocumentException ex) {
            throw new RuntimeException("Failed to generate employee PDF report", ex);
        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    private void addCell(PdfPTable table, String value) {
        PdfPCell cell = new PdfPCell(new Phrase(value != null ? value : "-", CELL_FONT));
        cell.setPadding(5);
        table.addCell(cell);
    }
}
