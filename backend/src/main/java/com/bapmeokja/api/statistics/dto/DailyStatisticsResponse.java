package com.bapmeokja.api.statistics.dto;

import java.time.LocalDate;

public record DailyStatisticsResponse(
        LocalDate date,
        int calorieGoal,
        int calorieConsumed,
        int caloriePercentage,
        NutrientProgress carb,
        NutrientProgress protein,
        NutrientProgress fat
) {
    public record NutrientProgress(int goalGram, double consumedGram, int percentage) {
    }
}
