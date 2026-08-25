package com.bapmeokja.api.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "notification_settings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "push_enabled", nullable = false)
    private boolean pushEnabled;

    @Column(name = "water_reminder_enabled", nullable = false)
    private boolean waterReminderEnabled;

    @Column(name = "breakfast_time")
    private LocalTime breakfastTime;

    @Column(name = "lunch_time")
    private LocalTime lunchTime;

    @Column(name = "dinner_time")
    private LocalTime dinnerTime;

    @Column(name = "expiry_alert_enabled", nullable = false)
    private boolean expiryAlertEnabled;

    public static NotificationSetting defaults(User user) {
        NotificationSetting setting = new NotificationSetting();
        setting.user = user;
        setting.pushEnabled = true;
        setting.waterReminderEnabled = true;
        setting.breakfastTime = LocalTime.of(8, 0);
        setting.lunchTime = LocalTime.of(12, 0);
        setting.dinnerTime = LocalTime.of(18, 30);
        setting.expiryAlertEnabled = true;
        return setting;
    }

    public void update(
            Boolean pushEnabled,
            Boolean waterReminderEnabled,
            LocalTime breakfastTime,
            LocalTime lunchTime,
            LocalTime dinnerTime,
            Boolean expiryAlertEnabled
    ) {
        if (pushEnabled != null) {
            this.pushEnabled = pushEnabled;
        }
        if (waterReminderEnabled != null) {
            this.waterReminderEnabled = waterReminderEnabled;
        }
        if (breakfastTime != null) {
            this.breakfastTime = breakfastTime;
        }
        if (lunchTime != null) {
            this.lunchTime = lunchTime;
        }
        if (dinnerTime != null) {
            this.dinnerTime = dinnerTime;
        }
        if (expiryAlertEnabled != null) {
            this.expiryAlertEnabled = expiryAlertEnabled;
        }
    }
}
