package com.ems.notification;

import com.ems.common.enums.NotificationType;

/**
 * Implemented by NotificationService and used directly by other modules (it lives in the
 * top-level notification package, not notification.service, so other modules can depend on
 * just this interface without a package cycle).
 */
public interface NotificationPublisher {
    void notifyUser(Long userId, String title, String message, NotificationType type);
}
