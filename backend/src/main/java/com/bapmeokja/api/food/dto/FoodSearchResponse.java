package com.bapmeokja.api.food.dto;

import java.util.List;

public record FoodSearchResponse(
        List<FoodSummary> foods,
        long totalCount,
        int page,
        int size,
        boolean hasNext
) {
    public record FoodSummary(
            String foodId,
            String name,
            double baseWeightGram,
            int calorie,
            double carb,
            double protein,
            double fat
    ) {
    }
}
