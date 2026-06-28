package com.ems.performance.repository;

import com.ems.performance.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {

    List<PerformanceReview> findByEmployeeIdOrderByReviewPeriodDesc(Long employeeId);

    Optional<PerformanceReview> findByEmployeeIdAndReviewPeriod(Long employeeId, String reviewPeriod);

    boolean existsByEmployeeIdAndReviewPeriod(Long employeeId, String reviewPeriod);
}
