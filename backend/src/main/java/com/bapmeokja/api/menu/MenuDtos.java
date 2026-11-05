package com.bapmeokja.api.menu;

import java.time.LocalDate;
import java.util.List;

public final class MenuDtos {
    private MenuDtos() {
    }

    public record RecommendationSummary(
            LocalDate date,
            int calorieRemaining,
            int calorieGoal,
            int calorieConsumed,
            MacroPercentage carb,
            MacroPercentage protein,
            MacroPercentage fat,
            DefaultBudget defaultBudget
    ) {
    }

    public record MacroPercentage(int percentage) {
    }

    public record DefaultBudget(int diningOut, int homeCooking) {
    }

    public record DiningRecommendationResponse(
            List<RecommendedCategory> recommendedCategories,
            int appliedBudget
    ) {
    }

    public record RecommendedCategory(
            String categoryId,
            String categoryName,
            String iconUrl,
            String reason,
            int estimatedCost,
            boolean isWithinBudget,
            String itemId,
            String menuName
    ) {
    }

    public record CategoryItemsResponse(String categoryName, List<MenuItemSummary> items) {
    }

    public record MenuItemSummary(
            String itemId,
            String name,
            String imageUrl,
            double calorie,
            double carb,
            double protein,
            double fat,
            Integer avgPrice,
            Boolean isWithinBudget
    ) {
    }

    public record MenuItemDetail(
            String itemId,
            String name,
            String imageUrl,
            double calorie,
            double carb,
            double protein,
            double fat,
            List<Ingredient> ingredients
    ) {
    }

    public record Ingredient(String name, double weightGram) {
    }
}
