package com.ems.department.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DesignationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private Long departmentId;
}
