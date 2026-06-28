package com.ems.performance.service;

import com.ems.common.exception.ConflictException;
import com.ems.common.exception.ResourceNotFoundException;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.performance.dto.PerformanceReviewRequest;
import com.ems.performance.dto.PerformanceReviewResponse;
import com.ems.performance.entity.PerformanceReview;
import com.ems.performance.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final PerformanceReviewRepository performanceReviewRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public PerformanceReviewResponse createReview(Long reviewerEmployeeId, PerformanceReviewRequest request) {
        if (performanceReviewRepository.existsByEmployeeIdAndReviewPeriod(
                request.getEmployeeId(), request.getReviewPeriod())) {
            throw new ConflictException("A review for this employee already exists for " + request.getReviewPeriod());
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", "id", request.getEmployeeId()));
        Employee reviewer = employeeRepository.findById(reviewerEmployeeId)
                .orElseThrow(() -> ResourceNotFoundException.of("Reviewer (Employee)", "id", reviewerEmployeeId));

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewPeriod(request.getReviewPeriod())
                .rating(request.getRating())
                .comments(request.getComments())
                .build();

        review = performanceReviewRepository.save(review);
        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<PerformanceReviewResponse> getReviewsForEmployee(Long employeeId) {
        return performanceReviewRepository.findByEmployeeIdOrderByReviewPeriodDesc(employeeId).stream()
                .map(this::toResponse)
                .toList();
    }

    private PerformanceReviewResponse toResponse(PerformanceReview r) {
        return PerformanceReviewResponse.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getFullName())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getFullName())
                .reviewPeriod(r.getReviewPeriod())
                .rating(r.getRating())
                .comments(r.getComments())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
