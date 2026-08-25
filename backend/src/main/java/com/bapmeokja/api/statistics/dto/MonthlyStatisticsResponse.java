package com.bapmeokja.api.statistics.dto;

import java.time.LocalDate;
import java.util.List;

public record MonthlyStatisticsResponse(
        int year,
        int month,
        List<DailyPoint> daily,
        int monthlyAvgCalorie,
        int monthlyAvgCarbPercentage,
        int monthlyAvgProteinPercentage,
        int monthlyAvgFatPercentage
) {
    public record DailyPoint(LocalDate date, int calorieConsumed, int calorieGoal) {
    }
}
