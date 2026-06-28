package com.ems.payroll.repository;

import com.ems.payroll.entity.Payslip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {

    Optional<Payslip> findByEmployeeIdAndPayMonthAndPayYear(Long employeeId, int payMonth, int payYear);

    boolean existsByEmployeeIdAndPayMonthAndPayYear(Long employeeId, int payMonth, int payYear);

    List<Payslip> findByEmployeeIdOrderByPayYearDescPayMonthDesc(Long employeeId);

    Page<Payslip> findByPayMonthAndPayYear(int payMonth, int payYear, Pageable pageable);
}
