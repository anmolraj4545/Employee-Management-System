package com.ems.employee.repository;

import com.ems.common.enums.EmployeeStatus;
import com.ems.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUserId(Long userId);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    long countByStatus(EmployeeStatus status);

    long countByDepartmentId(Long departmentId);

    @Query("""
            SELECT e FROM Employee e
            WHERE (:search IS NULL OR :search = '' OR
                   LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:departmentId IS NULL OR e.department.id = :departmentId)
              AND (:status IS NULL OR e.status = :status)
            """)
    Page<Employee> search(
            @Param("search") String search,
            @Param("departmentId") Long departmentId,
            @Param("status") EmployeeStatus status,
            Pageable pageable);

    @Query("SELECT MAX(e.id) FROM Employee e")
    Optional<Long> findMaxId();

    @Query("SELECT e FROM Employee e WHERE e.department.id = :departmentId")
    java.util.List<Employee> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("""
            SELECT COALESCE(d.name, 'Unassigned') AS label, COUNT(e) AS value
            FROM Employee e LEFT JOIN e.department d
            WHERE e.status = :status
            GROUP BY d.name
            """)
    java.util.List<Object[]> countActiveEmployeesByDepartment(@Param("status") EmployeeStatus status);
}
