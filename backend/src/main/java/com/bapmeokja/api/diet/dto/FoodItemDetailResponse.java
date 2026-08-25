package com.bapmeokja.api.diet.dto;

import java.util.List;

public record FoodItemDetailResponse(
        String itemId,
        String name,
        double totalWeightGram,
        int totalCalorie,
        double carb,
        double protein,
        double fat,
        double sodium,
        double cholesterol,
        List<Ingredient> ingredients
) {
    public record Ingredient(String name, double weightGram) {
    }
}
