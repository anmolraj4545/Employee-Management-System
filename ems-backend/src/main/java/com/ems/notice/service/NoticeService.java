package com.ems.notice.service;

import com.ems.common.enums.EmployeeStatus;
import com.ems.common.enums.NotificationType;
import com.ems.common.exception.ResourceNotFoundException;
import com.ems.employee.entity.Employee;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.notice.dto.NoticeRequest;
import com.ems.notice.dto.NoticeResponse;
import com.ems.notice.entity.Notice;
import com.ems.notice.repository.NoticeRepository;
import com.ems.notification.NotificationPublisher;
import com.ems.user.User;
import com.ems.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    /** Optional, wired at startup once the notification module exists. */
    private NotificationPublisher notificationPublisher;

    public void setNotificationPublisher(NotificationPublisher notificationPublisher) {
        this.notificationPublisher = notificationPublisher;
    }

    @Transactional
    public NoticeResponse createNotice(Long publisherUserId, NoticeRequest request) {
        User publisher = userRepository.findById(publisherUserId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "id", publisherUserId));

        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .publishedBy(publisher)
                .active(true)
                .build();
        notice = noticeRepository.save(notice);

        broadcastToActiveEmployees(notice);

        return toResponse(notice);
    }

    @Transactional
    public NoticeResponse updateNotice(Long id, NoticeRequest request) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Notice", "id", id));
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice = noticeRepository.save(notice);
        return toResponse(notice);
    }

    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Notice", "id", id));
        notice.setActive(false);
        noticeRepository.save(notice);
    }

    @Transactional(readOnly = true)
    public Page<NoticeResponse> getActiveNotices(Pageable pageable) {
        return noticeRepository.findByActiveTrueOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    private void broadcastToActiveEmployees(Notice notice) {
        if (notificationPublisher == null) {
            return;
        }
        java.util.List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE && e.getUser() != null)
                .toList();

        for (Employee employee : activeEmployees) {
            notificationPublisher.notifyUser(
                    employee.getUser().getId(),
                    "New Notice: " + notice.getTitle(),
                    "A new notice has been published. Check the notice board for details.",
                    NotificationType.NOTICE_BOARD);
        }
        log.info("Broadcasted notice '{}' to {} employee(s)", notice.getTitle(), activeEmployees.size());
    }

    private NoticeResponse toResponse(Notice n) {
        return NoticeResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .publishedByName(n.getPublishedBy().getUsername())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
