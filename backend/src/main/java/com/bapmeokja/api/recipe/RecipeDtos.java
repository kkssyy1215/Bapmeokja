package com.bapmeokja.api.recipe;

import java.util.List;

public final class RecipeDtos {
    private RecipeDtos() {
    }

    public record HomeRecommendationResponse(
            List<HomeCategory> recommendedCategories,
            int appliedBudget
    ) {
    }

    public record HomeCategory(
            String categoryId,
            String categoryName,
            String imageUrl,
            String reason,
            int estimatedCost,
            boolean isWithinBudget
    ) {
    }

    public record RecipeListResponse(String categoryName, List<RecipeSummary> recipes) {
    }

    public record RecipeSummary(
            String recipeId,
            String name,
            String imageUrl,
            double calorie,
            double carb,
            double protein,
            double fat,
            int cookingTimeMinutes,
            Difficulty difficulty,
            int estimatedCost,
            boolean isWithinBudget
    ) {
    }

    public record RecipeDetailResponse(
            String recipeId,
            String name,
            String imageUrl,
            double calorie,
            double carb,
            double protein,
            double fat,
            int cookingTimeMinutes,
            Difficulty difficulty,
            int estimatedCost,
            List<Ingredient> ingredients,
            List<Step> steps
    ) {
    }

    public record Ingredient(String name, String amount, List<Alternative> alternatives) {
    }

    public record Alternative(String name, String reason) {
    }

    public record Step(int stepNo, String description) {
    }
}
