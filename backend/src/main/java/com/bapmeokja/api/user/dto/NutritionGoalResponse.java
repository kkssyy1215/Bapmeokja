package com.bapmeokja.api.user.dto;

import com.bapmeokja.api.user.domain.NutritionGoals;

public record NutritionGoalResponse(
        int dailyCalorieGoal,
        int carbGoalGram,
        int proteinGoalGram,
        int fatGoalGram,
        boolean isPreciseMode
) {
    public static NutritionGoalResponse from(NutritionGoals goals) {
        return new NutritionGoalResponse(
                goals.dailyCalorieGoal(),
                goals.carbGoalGram(),
                goals.proteinGoalGram(),
                goals.fatGoalGram(),
                goals.preciseMode()
        );
    }
}
