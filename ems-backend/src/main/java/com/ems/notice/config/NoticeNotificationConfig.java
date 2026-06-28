package com.ems.notice.config;

import com.ems.notice.service.NoticeService;
import com.ems.notification.service.NotificationService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NoticeNotificationConfig {

    private final NoticeService noticeService;
    private final NotificationService notificationService;

    @PostConstruct
    public void wireNotificationPublisher() {
        noticeService.setNotificationPublisher(notificationService);
    }
}
