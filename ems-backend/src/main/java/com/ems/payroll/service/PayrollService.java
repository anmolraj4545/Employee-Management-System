package com.ems.payroll.service;

import com.ems.common.enums.EmployeeStatus;
import com.ems.common.enums.PayslipStatus;
import com.ems.common.exception.BadRequestException;
import com.ems.common.exception.ResourceNotFoundException;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.payroll.dto.*;
import com.ems.payroll.entity.Payslip;
import com.ems.payroll.entity.SalaryStructure;
import com.ems.payroll.repository.PayslipRepository;
import com.ems.payroll.repository.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final PayslipRepository payslipRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public SalaryStructureResponse createOrUpdateSalaryStructure(SalaryStructureRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", request.getEmployeeId()));

        SalaryStructure structure = salaryStructureRepository.findByEmployeeId(request.getEmployeeId())
                .orElseGet(() -> SalaryStructure.builder().employee(employee).build());

        structure.setBasicSalary(request.getBasicSalary());
        structure.setHra(nz(request.getHra()));
        structure.setBonus(nz(request.getBonus()));
        structure.setIncentive(nz(request.getIncentive()));
        structure.setPfPercent(request.getPfPercent() != null ? request.getPfPercent() : BigDecimal.valueOf(12.00));
        structure.setTaxPercent(nz(request.getTaxPercent()));
        structure.setEffectiveFrom(request.getEffectiveFrom());

        structure = salaryStructureRepository.save(structure);
        return toStructureResponse(structure);
    }

    @Transactional(readOnly = true)
    public SalaryStructureResponse getSalaryStructure(Long employeeId) {
        SalaryStructure structure = salaryStructureRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("No salary structure configured for this employee"));
        return toStructureResponse(structure);
    }

    @Transactional
    public List<PayslipResponse> generatePayroll(GeneratePayrollRequest request) {
        List<Employee> targets;
        if (request.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", request.getEmployeeId()));
            targets = List.of(employee);
        } else {
            targets = employeeRepository.findAll().stream()
                    .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                    .toList();
        }

        List<PayslipResponse> generated = new ArrayList<>();

        for (Employee employee : targets) {
            if (payslipRepository.existsByEmployeeIdAndPayMonthAndPayYear(
                    employee.getId(), request.getPayMonth(), request.getPayYear())) {
                log.info("Payslip already exists for employee {} for {}/{}, skipping",
                        employee.getEmployeeCode(), request.getPayMonth(), request.getPayYear());
                continue;
            }

            SalaryStructure structure = salaryStructureRepository.findByEmployeeId(employee.getId()).orElse(null);
            if (structure == null) {
                log.warn("No salary structure for employee {}, skipping payroll generation",
                        employee.getEmployeeCode());
                continue;
            }

            Payslip payslip = buildPayslip(employee, structure, request.getPayMonth(), request.getPayYear());
            payslip = payslipRepository.save(payslip);
            generated.add(toPayslipResponse(payslip));
        }

        log.info("Generated {} payslip(s) for {}/{}", generated.size(), request.getPayMonth(), request.getPayYear());
        return generated;
    }

    @Transactional(readOnly = true)
    public List<PayslipResponse> getOwnPayslips(Long employeeId) {
        return payslipRepository.findByEmployeeIdOrderByPayYearDescPayMonthDesc(employeeId).stream()
                .map(this::toPayslipResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PayslipResponse getPayslipById(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> ResourceNotFoundException.of("Payslip", "id", payslipId));
        return toPayslipResponse(payslip);
    }

    @Transactional(readOnly = true)
    public Page<PayslipResponse> getMonthlyPayroll(int payMonth, int payYear, Pageable pageable) {
        return payslipRepository.findByPayMonthAndPayYear(payMonth, payYear, pageable).map(this::toPayslipResponse);
    }

    @Transactional(readOnly = true)
    public PayrollSummary getMonthlySummary(int payMonth, int payYear) {
        List<Payslip> payslips = payslipRepository.findByPayMonthAndPayYear(payMonth, payYear, Pageable.unpaged())
                .getContent();

        BigDecimal totalGross = payslips.stream().map(Payslip::getGrossSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNet = payslips.stream().map(Payslip::getNetSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDeductions = totalGross.subtract(totalNet);

        return PayrollSummary.builder()
                .payMonth(payMonth)
                .payYear(payYear)
                .payslipCount(payslips.size())
                .totalGross(totalGross)
                .totalDeductions(totalDeductions)
                .totalNet(totalNet)
                .build();
    }

    /** Marks a payslip as PAID. Separate from generation so HR can review GENERATED payslips before disbursing. */
    @Transactional
    public PayslipResponse markAsPaid(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> ResourceNotFoundException.of("Payslip", "id", payslipId));
        if (payslip.getStatus() == PayslipStatus.PAID) {
            throw new BadRequestException("Payslip is already marked as paid");
        }
        payslip.setStatus(PayslipStatus.PAID);
        payslip = payslipRepository.save(payslip);
        return toPayslipResponse(payslip);
    }

    // ---------- helpers ----------

    private Payslip buildPayslip(Employee employee, SalaryStructure structure, int payMonth, int payYear) {
        BigDecimal basic = structure.getBasicSalary();
        BigDecimal hra = structure.getHra();
        BigDecimal bonus = structure.getBonus();
        BigDecimal incentive = structure.getIncentive();

        BigDecimal gross = basic.add(hra).add(bonus).add(incentive);

        BigDecimal pfDeduction = basic
                .multiply(structure.getPfPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal taxDeduction = gross
                .multiply(structure.getTaxPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal netSalary = gross.subtract(pfDeduction).subtract(taxDeduction);

        return Payslip.builder()
                .employee(employee)
                .payMonth(payMonth)
                .payYear(payYear)
                .basicSalary(basic)
                .hra(hra)
                .bonus(bonus)
                .incentive(incentive)
                .pfDeduction(pfDeduction)
                .taxDeduction(taxDeduction)
                .otherDeductions(BigDecimal.ZERO)
                .grossSalary(gross)
                .netSalary(netSalary)
                .status(PayslipStatus.GENERATED)
                .build();
    }

    private BigDecimal nz(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private SalaryStructureResponse toStructureResponse(SalaryStructure s) {
        return SalaryStructureResponse.builder()
                .id(s.getId())
                .employeeId(s.getEmployee().getId())
                .employeeName(s.getEmployee().getFullName())
                .basicSalary(s.getBasicSalary())
                .hra(s.getHra())
                .bonus(s.getBonus())
                .incentive(s.getIncentive())
                .pfPercent(s.getPfPercent())
                .taxPercent(s.getTaxPercent())
                .effectiveFrom(s.getEffectiveFrom())
                .build();
    }

    private PayslipResponse toPayslipResponse(Payslip p) {
        Employee e = p.getEmployee();
        return PayslipResponse.builder()
                .id(p.getId())
                .employeeId(e.getId())
                .employeeName(e.getFullName())
                .employeeCode(e.getEmployeeCode())
                .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .payMonth(p.getPayMonth())
                .payYear(p.getPayYear())
                .basicSalary(p.getBasicSalary())
                .hra(p.getHra())
                .bonus(p.getBonus())
                .incentive(p.getIncentive())
                .pfDeduction(p.getPfDeduction())
                .taxDeduction(p.getTaxDeduction())
                .otherDeductions(p.getOtherDeductions())
                .grossSalary(p.getGrossSalary())
                .netSalary(p.getNetSalary())
                .status(p.getStatus())
                .generatedAt(p.getGeneratedAt())
                .build();
    }
}
