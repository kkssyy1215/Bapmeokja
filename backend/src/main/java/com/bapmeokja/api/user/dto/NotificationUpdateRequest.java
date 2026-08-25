package com.bapmeokja.api.user.dto;

import jakarta.validation.constraints.Pattern;

public record NotificationUpdateRequest(
        Boolean pushEnabled,
        Boolean waterReminderEnabled,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "알림 시각은 HH:mm 형식으로 입력해주세요.")
        String breakfastTime,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "알림 시각은 HH:mm 형식으로 입력해주세요.")
        String lunchTime,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "알림 시각은 HH:mm 형식으로 입력해주세요.")
        String dinnerTime,
        Boolean expiryAlertEnabled
) {
}
