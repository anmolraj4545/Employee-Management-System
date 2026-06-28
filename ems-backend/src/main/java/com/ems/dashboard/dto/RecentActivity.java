package com.ems.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivity {
    private String type;       // LEAVE_REQUEST, NEW_EMPLOYEE, NOTICE, etc.
    private String description;
    private LocalDateTime timestamp;
}
