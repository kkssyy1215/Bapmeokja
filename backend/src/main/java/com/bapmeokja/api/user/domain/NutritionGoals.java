package com.bapmeokja.api.user.domain;

public record NutritionGoals(
        int dailyCalorieGoal,
        int carbGoalGram,
        int proteinGoalGram,
        int fatGoalGram,
        boolean preciseMode
) {
}
