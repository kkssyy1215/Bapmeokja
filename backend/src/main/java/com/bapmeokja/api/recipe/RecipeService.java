package com.bapmeokja.api.recipe;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.fridge.FridgeIngredient;
import com.bapmeokja.api.fridge.FridgeIngredientRepository;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.user.domain.User;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecipeService {
    private final RecipeCategoryRepository categoryRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository ingredientRepository;
    private final RecipeIngredientAlternativeRepository alternativeRepository;
    private final RecipeStepRepository stepRepository;
    private final FridgeIngredientRepository fridgeRepository;
    private final CurrentUserProvider currentUserProvider;

    public RecipeDtos.HomeRecommendationResponse recommendHomeCooking(Integer budget) {
        User user = currentUserProvider.get();
        int appliedBudget = budget == null ? user.getDefaultBudgetHomeCooking() : budget;
        validateBudget(appliedBudget);
        Set<String> fridgeNames = fridgeNames(user.getId());
        List<Recipe> recipes = recipeRepository.findAllByOrderByEstimatedCostAsc();
        Map<String, List<Recipe>> recipesByCategory = recipes.stream()
                .collect(Collectors.groupingBy(recipe -> recipe.getCategory().getId()));

        List<RecipeDtos.HomeCategory> categories = categoryRepository.findAll().stream()
                .map(category -> {
                    List<Recipe> categoryRecipes = recipesByCategory.getOrDefault(category.getId(), List.of());
                    int cost = categoryRecipes.stream().mapToInt(Recipe::getEstimatedCost).min().orElse(0);
                    boolean canUseFridge = categoryRecipes.stream()
                            .flatMap(recipe -> ingredientRepository.findByRecipeIdOrderByIdAsc(recipe.getId()).stream())
                            .map(RecipeIngredient::getName)
                            .map(this::normalize)
                            .anyMatch(fridgeNames::contains);
                    String reason = canUseFridge
                            ? "냉장고에 있는 재료를 활용할 수 있습니다."
                            : "오늘의 영양 균형을 채우기 좋은 메뉴입니다.";
                    return new RecipeDtos.HomeCategory(
                            category.getId(),
                            category.getName(),
                            category.getImageUrl(),
                            reason,
                            cost,
                            cost <= appliedBudget
                    );
                })
                .sorted(Comparator.comparing(RecipeDtos.HomeCategory::isWithinBudget).reversed()
                        .thenComparingInt(RecipeDtos.HomeCategory::estimatedCost))
                .toList();
        return new RecipeDtos.HomeRecommendationResponse(categories, appliedBudget);
    }

    public RecipeDtos.RecipeListResponse getRecipes(String categoryId, Integer budget) {
        RecipeCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 레시피 카테고리입니다."));
        int appliedBudget = budget == null ? Integer.MAX_VALUE : budget;
        if (budget != null) {
            validateBudget(budget);
        }
        List<RecipeDtos.RecipeSummary> recipes = recipeRepository
                .findByCategoryIdOrderByEstimatedCostAsc(categoryId)
                .stream()
                .map(recipe -> toSummary(recipe, appliedBudget))
                .toList();
        return new RecipeDtos.RecipeListResponse(category.getName(), recipes);
    }

    public RecipeDtos.RecipeDetailResponse getRecipe(String recipeId) {
        Recipe recipe = findRecipe(recipeId);
        List<RecipeIngredient> ingredients = ingredientRepository.findByRecipeIdOrderByIdAsc(recipeId);
        Map<Long, List<RecipeIngredientAlternative>> alternatives = ingredients.isEmpty()
                ? Map.of()
                : alternativeRepository.findAllByRecipeIngredient_IdIn(
                                ingredients.stream().map(RecipeIngredient::getId).toList()
                        ).stream()
                        .collect(Collectors.groupingBy(item -> item.getRecipeIngredient().getId()));
        List<RecipeDtos.Ingredient> ingredientResponses = ingredients.stream()
                .map(ingredient -> new RecipeDtos.Ingredient(
                        ingredient.getName(),
                        ingredient.getAmount(),
                        alternatives.getOrDefault(ingredient.getId(), List.of()).stream()
                                .map(alternative -> new RecipeDtos.Alternative(
                                        alternative.getName(),
                                        alternative.getReason()
                                ))
                                .toList()
                ))
                .toList();
        List<RecipeDtos.Step> steps = stepRepository.findByRecipeIdOrderByStepNoAsc(recipeId).stream()
                .map(step -> new RecipeDtos.Step(step.getStepNo(), step.getDescription()))
                .toList();
        return new RecipeDtos.RecipeDetailResponse(
                recipe.getId(),
                recipe.getName(),
                recipe.getImageUrl(),
                recipe.getCalorie(),
                recipe.getCarb(),
                recipe.getProtein(),
                recipe.getFat(),
                recipe.getCookingTimeMinutes(),
                recipe.getDifficulty(),
                recipe.getEstimatedCost(),
                ingredientResponses,
                steps
        );
    }

    public RecipeDtos.RecipeListResponse recommendLeftover() {
        User user = currentUserProvider.get();
        List<FridgeIngredient> fridgeItems = fridgeRepository
                .findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(user.getId());
        if (fridgeItems.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.RESOURCE_NOT_FOUND,
                    "등록된 냉장고 재료가 없습니다. 재료를 먼저 등록해주세요."
            );
        }
        Set<String> names = fridgeItems.stream()
                .map(FridgeIngredient::getName)
                .map(this::normalize)
                .collect(Collectors.toSet());
        List<Recipe> recipes = recipeRepository.findAllByOrderByEstimatedCostAsc();
        Map<String, Integer> scores = new HashMap<>();
        for (Recipe recipe : recipes) {
            int score = (int) ingredientRepository.findByRecipeIdOrderByIdAsc(recipe.getId()).stream()
                    .map(RecipeIngredient::getName)
                    .map(this::normalize)
                    .filter(names::contains)
                    .count();
            scores.put(recipe.getId(), score);
        }
        List<RecipeDtos.RecipeSummary> result = recipes.stream()
                .sorted(Comparator.<Recipe>comparingInt(recipe -> scores.getOrDefault(recipe.getId(), 0))
                        .reversed()
                        .thenComparingInt(Recipe::getEstimatedCost))
                .limit(6)
                .map(recipe -> toSummary(recipe, Integer.MAX_VALUE))
                .toList();
        return new RecipeDtos.RecipeListResponse("남은 재료 추천", result);
    }

    public Recipe findRecipe(String recipeId) {
        return recipeRepository.findById(recipeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 레시피입니다."));
    }

    private RecipeDtos.RecipeSummary toSummary(Recipe recipe, int budget) {
        return new RecipeDtos.RecipeSummary(
                recipe.getId(),
                recipe.getName(),
                recipe.getImageUrl(),
                recipe.getCalorie(),
                recipe.getCarb(),
                recipe.getProtein(),
                recipe.getFat(),
                recipe.getCookingTimeMinutes(),
                recipe.getDifficulty(),
                recipe.getEstimatedCost(),
                recipe.getEstimatedCost() <= budget
        );
    }

    private Set<String> fridgeNames(Long userId) {
        return fridgeRepository.findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(userId).stream()
                .map(FridgeIngredient::getName)
                .map(this::normalize)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private String normalize(String value) {
        return value.replaceAll("\\s+", "").toLowerCase(Locale.KOREAN);
    }

    private void validateBudget(int budget) {
        if (budget < 0 || budget > 10_000_000) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "예산 범위를 확인해주세요.");
        }
    }
}
