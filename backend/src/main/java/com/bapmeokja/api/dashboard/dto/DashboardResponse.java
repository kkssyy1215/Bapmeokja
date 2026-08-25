package com.bapmeokja.api.dashboard.dto;

import java.time.LocalDate;

public record DashboardResponse(
        String nickname,
        LocalDate date,
        TomatoStatus tomatoStatus,
        int calorieGoal,
        int calorieConsumed,
        int calorieRemaining,
        int calorieExceeded,
        NutrientProgress carb,
        NutrientProgress protein,
        NutrientProgress fat
) {
    public record NutrientProgress(int goalGram, double consumedGram, int percentage) {
    }
}
