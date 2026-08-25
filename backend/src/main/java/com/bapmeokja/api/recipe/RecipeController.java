package com.bapmeokja.api.recipe;

import com.bapmeokja.api.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/menu")
@RequiredArgsConstructor
public class RecipeController {
    private final RecipeService recipeService;

    @GetMapping("/recommend/home-cooking")
    public ApiResponse<RecipeDtos.HomeRecommendationResponse> recommendHomeCooking(
            @RequestParam(required = false) Integer budget
    ) {
        return ApiResponse.success(recipeService.recommendHomeCooking(budget), "추천 완료");
    }

    @GetMapping("/recipes")
    public ApiResponse<RecipeDtos.RecipeListResponse> getRecipes(
            @RequestParam String categoryId,
            @RequestParam(required = false) Integer budget
    ) {
        return ApiResponse.success(recipeService.getRecipes(categoryId, budget), "조회 성공");
    }

    @GetMapping("/recipes/{recipeId}")
    public ApiResponse<RecipeDtos.RecipeDetailResponse> getRecipe(@PathVariable String recipeId) {
        return ApiResponse.success(recipeService.getRecipe(recipeId), "조회 성공");
    }

    @PostMapping("/recommend/leftover")
    public ApiResponse<RecipeDtos.RecipeListResponse> recommendLeftover() {
        return ApiResponse.success(recipeService.recommendLeftover(), "추천 완료");
    }
}
