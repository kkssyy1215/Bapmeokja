package com.bapmeokja.api.feedback.dto;

import java.util.List;

public record FeedbackResponse(
        String period,
        PeriodType periodType,
        Object calorieAnalysis,
        Object nutritionBalance,
        List<String> suggestions,
        String overallFeedback
) {
    public record DailyCalorieAnalysis(int consumed, int goal, String comment) {
    }

    public record AggregateCalorieAnalysis(int avgConsumed, int goal, String comment) {
    }

    public record DailyNutritionBalance(
            int carbPercentage,
            int proteinPercentage,
            int fatPercentage,
            String comment
    ) {
    }

    public record AggregateNutritionBalance(
            int avgCarbPercentage,
            int avgProteinPercentage,
            int avgFatPercentage,
            String comment
    ) {
    }
}
