package com.bapmeokja.api.user.dto;

import com.bapmeokja.api.user.domain.ActivityLevel;
import com.bapmeokja.api.user.domain.Gender;
import com.bapmeokja.api.user.domain.Goal;
import com.bapmeokja.api.user.domain.NotificationSetting;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalTime;

public record ProfileResponse(
        String nickname,
        String name,
        String email,
        Gender gender,
        Integer age,
        Double height,
        Double weight,
        ActivityLevel activityLevel,
        Goal goal,
        Integer dailyCalorieGoal,
        Integer carbGoalGram,
        Integer proteinGoalGram,
        Integer fatGoalGram,
        Double skeletalMuscleMass,
        Double bodyFatMass,
        Double bodyFatPercentage,
        boolean isPreciseMode,
        NotificationResponse notification,
        BudgetResponse defaultBudget
) {
    public static ProfileResponse of(User user, NotificationSetting notification) {
        return new ProfileResponse(
                user.getNickname(),
                user.getName(),
                user.getEmail(),
                user.getGender(),
                user.getAge(),
                user.getHeight(),
                user.getWeight(),
                user.getActivityLevel(),
                user.getGoal(),
                user.getDailyCalorieGoal(),
                user.getCarbGoalGram(),
                user.getProteinGoalGram(),
                user.getFatGoalGram(),
                user.getSkeletalMuscleMass(),
                user.getBodyFatMass(),
                user.getBodyFatPercentage(),
                user.isPreciseMode(),
                NotificationResponse.from(notification),
                new BudgetResponse(user.getDefaultBudgetDiningOut(), user.getDefaultBudgetHomeCooking())
        );
    }

    public record NotificationResponse(
            boolean pushEnabled,
            boolean waterReminderEnabled,
            String breakfastTime,
            String lunchTime,
            String dinnerTime,
            boolean expiryAlertEnabled
    ) {
        static NotificationResponse from(NotificationSetting setting) {
            return new NotificationResponse(
                    setting.isPushEnabled(),
                    setting.isWaterReminderEnabled(),
                    format(setting.getBreakfastTime()),
                    format(setting.getLunchTime()),
                    format(setting.getDinnerTime()),
                    setting.isExpiryAlertEnabled()
            );
        }

        private static String format(LocalTime time) {
            return time == null ? null : time.toString().substring(0, 5);
        }
    }

    public record BudgetResponse(Integer diningOut, Integer homeCooking) {
    }
}
