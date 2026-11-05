package com.bapmeokja.api.menu;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.common.time.AppTime;
import com.bapmeokja.api.diet.service.DailyNutritionQueryService;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {
    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository itemRepository;
    private final MenuItemIngredientRepository ingredientRepository;
    private final DailyNutritionQueryService nutritionQueryService;
    private final CurrentUserProvider currentUserProvider;

    public MenuDtos.RecommendationSummary getSummary() {
        User user = currentUserProvider.get();
        DailyNutritionSummary consumed = nutritionQueryService.summarizeToday(user);
        int calorieGoal = positiveOrDefault(user.getDailyCalorieGoal(), 2000);
        int calorieConsumed = rounded(consumed.calorie());
        return new MenuDtos.RecommendationSummary(
                AppTime.today(),
                Math.max(0, calorieGoal - calorieConsumed),
                calorieGoal,
                calorieConsumed,
                new MenuDtos.MacroPercentage(percentage(consumed.carb(), user.getCarbGoalGram())),
                new MenuDtos.MacroPercentage(percentage(consumed.protein(), user.getProteinGoalGram())),
                new MenuDtos.MacroPercentage(percentage(consumed.fat(), user.getFatGoalGram())),
                new MenuDtos.DefaultBudget(
                        positiveOrDefault(user.getDefaultBudgetDiningOut(), 10000),
                        positiveOrDefault(user.getDefaultBudgetHomeCooking(), 8000)
                )
        );
    }

    public MenuDtos.DiningRecommendationResponse recommendDiningOut(Integer budget) {
        User user = currentUserProvider.get();
        int appliedBudget = budget == null ? user.getDefaultBudgetDiningOut() : budget;
        validateBudget(appliedBudget);
        DailyNutritionSummary consumed = nutritionQueryService.summarizeToday(user);
        String reason = nutritionReason(user, consumed);
        // 예산 안에서 주문할 수 있는 메뉴가 있는 종류만, 저렴한 순서로 추천한다.
        List<MenuDtos.RecommendedCategory> categories = categoryRepository.findAll().stream()
                .flatMap(category -> {
                    List<MenuItem> affordable = itemRepository.findByCategoryIdOrderByAvgPriceAsc(category.getId()).stream()
                            .filter(item -> item.getAvgPrice() <= appliedBudget)
                            .toList();
                    if (affordable.isEmpty()) {
                        return Stream.empty();
                    }
                    return Stream.of(new MenuDtos.RecommendedCategory(
                            category.getId(),
                            category.getName(),
                            category.getIconUrl(),
                            reason + " 예산 안 메뉴 " + affordable.size() + "개",
                            affordable.get(0).getAvgPrice(),
                            true
                    ));
                })
                .sorted(Comparator.comparingInt(MenuDtos.RecommendedCategory::estimatedCost))
                .limit(6)
                .toList();
        return new MenuDtos.DiningRecommendationResponse(categories, appliedBudget);
    }

    public MenuDtos.CategoryItemsResponse getCategoryItems(String categoryId, Integer budget) {
        MenuCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 메뉴 카테고리입니다."));
        if (budget != null) {
            validateBudget(budget);
        }
        List<MenuDtos.MenuItemSummary> items = itemRepository
                .findByCategoryIdOrderByAvgPriceAsc(categoryId)
                .stream()
                .map(item -> new MenuDtos.MenuItemSummary(
                        item.getId(),
                        item.getName(),
                        item.getImageUrl(),
                        item.getCalorie(),
                        item.getCarb(),
                        item.getProtein(),
                        item.getFat(),
                        budget == null ? null : item.getAvgPrice(),
                        budget == null ? null : item.getAvgPrice() <= budget
                ))
                .toList();
        return new MenuDtos.CategoryItemsResponse(category.getName(), items);
    }

    public MenuDtos.MenuItemDetail getItem(String itemId) {
        MenuItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 메뉴입니다."));
        List<MenuDtos.Ingredient> ingredients = ingredientRepository
                .findByMenuItemIdOrderByIdAsc(itemId)
                .stream()
                .map(ingredient -> new MenuDtos.Ingredient(
                        ingredient.getName(),
                        ingredient.getWeightGram()
                ))
                .toList();
        return new MenuDtos.MenuItemDetail(
                item.getId(),
                item.getName(),
                item.getImageUrl(),
                item.getCalorie(),
                item.getCarb(),
                item.getProtein(),
                item.getFat(),
                ingredients
        );
    }

    private String nutritionReason(User user, DailyNutritionSummary consumed) {
        List<NutrientGap> gaps = List.of(
                new NutrientGap("단백질", percentage(consumed.protein(), user.getProteinGoalGram())),
                new NutrientGap("탄수화물", percentage(consumed.carb(), user.getCarbGoalGram())),
                new NutrientGap("지방", percentage(consumed.fat(), user.getFatGoalGram()))
        );
        NutrientGap lowest = gaps.stream().min(Comparator.comparingInt(NutrientGap::percentage)).orElse(gaps.get(0));
        return lowest.name() + " 보충과 균형 잡힌 식사에 도움이 됩니다.";
    }

    private int percentage(double consumed, Integer goal) {
        int safeGoal = positiveOrDefault(goal, 1);
        return rounded(consumed / safeGoal * 100);
    }

    private int positiveOrDefault(Integer value, int fallback) {
        return value == null || value <= 0 ? fallback : value;
    }

    private int rounded(double value) {
        return (int) Math.round(value);
    }

    private void validateBudget(int budget) {
        if (budget < 0 || budget > 10_000_000) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "예산 범위를 확인해주세요.");
        }
    }

    private record NutrientGap(String name, int percentage) {
    }
}
