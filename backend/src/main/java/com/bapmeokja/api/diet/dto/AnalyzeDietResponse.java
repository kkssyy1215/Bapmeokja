package com.bapmeokja.api.diet.dto;

import java.util.List;

public record AnalyzeDietResponse(
        String analyzeId,
        String foodName,
        int totalCalorie,
        double totalCarb,
        double totalProtein,
        double totalFat,
        List<AnalyzedItem> items
) {
    public record AnalyzedItem(
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
