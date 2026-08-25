package com.bapmeokja.api.statistics.dto;

import java.time.LocalDate;
import java.util.List;

public record WeeklyStatisticsResponse(
        LocalDate startDate,
        LocalDate endDate,
        List<DailyPoint> daily,
        int weeklyAvgCalorie
) {
    public record DailyPoint(
            LocalDate date,
            int calorieConsumed,
            int calorieGoal,
            int carbPercentage,
            int proteinPercentage,
            int fatPercentage
    ) {
    }
}
