package com.ems.department.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignationResponse {
    private Long id;
    private String title;
    private Long departmentId;
    private String departmentName;
}
