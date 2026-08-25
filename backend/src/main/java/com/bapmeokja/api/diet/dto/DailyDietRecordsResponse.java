package com.bapmeokja.api.diet.dto;

import com.bapmeokja.api.diet.domain.MealType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record DailyDietRecordsResponse(
        LocalDate date,
        int totalCalorie,
        List<RecordSummary> records
) {
    public record RecordSummary(
            String recordId,
            MealType mealType,
            Instant eatenAt,
            String thumbnailUrl,
            String foodName,
            double totalWeightGram,
            int totalCalorie,
            double carb,
            double protein,
            double fat
    ) {
    }
}
