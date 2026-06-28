package com.ems.performance.entity;

import com.ems.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    /** Format: "YYYY-MM", e.g. "2026-06" — matches the architecture doc's review_period spec. */
    @Column(name = "review_period", nullable = false, length = 20)
    private String reviewPeriod;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal rating;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;
}
