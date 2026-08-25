package com.bapmeokja.api.diet.dto;

import com.bapmeokja.api.diet.domain.MealType;
import java.time.Instant;
import java.util.List;

public record DietRecordDetailResponse(
        String recordId,
        String analyzeId,
        MealType mealType,
        Instant eatenAt,
        String thumbnailUrl,
        String foodName,
        double totalWeightGram,
        int totalCalorie,
        double carb,
        double protein,
        double fat,
        List<RecordItem> items
) {
    public record RecordItem(
            String itemId,
            String name,
            double weightGram,
            int calorie,
            double carb,
            double protein,
            double fat
    ) {
    }
}
