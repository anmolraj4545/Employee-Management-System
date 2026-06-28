package com.ems.leave.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeaveRejectRequest {

    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
}
