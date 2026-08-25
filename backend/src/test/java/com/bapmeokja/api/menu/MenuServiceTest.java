package com.bapmeokja.api.menu;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.diet.service.DailyNutritionQueryService;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.user.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MenuServiceTest {
    private DailyNutritionQueryService nutritionQueryService;
    private CurrentUserProvider currentUserProvider;
    private MenuService service;
    private User user;

    @BeforeEach
    void setUp() {
        nutritionQueryService = mock(DailyNutritionQueryService.class);
        currentUserProvider = mock(CurrentUserProvider.class);
        user = mock(User.class);
        when(currentUserProvider.get()).thenReturn(user);
        when(user.getDailyCalorieGoal()).thenReturn(2000);
        when(user.getCarbGoalGram()).thenReturn(250);
        when(user.getProteinGoalGram()).thenReturn(125);
        when(user.getFatGoalGram()).thenReturn(55);
        when(user.getDefaultBudgetDiningOut()).thenReturn(10000);
        when(user.getDefaultBudgetHomeCooking()).thenReturn(8000);
        service = new MenuService(
                mock(MenuCategoryRepository.class),
                mock(MenuItemRepository.class),
                mock(MenuItemIngredientRepository.class),
                nutritionQueryService,
                currentUserProvider
        );
    }

    @Test
    void summaryUsesTodayNutritionAndPreservesOverOneHundredPercent() {
        when(nutritionQueryService.summarizeToday(user))
                .thenReturn(new DailyNutritionSummary(1500, 300, 62.5, 44, 3));

        MenuDtos.RecommendationSummary result = service.getSummary();

        assertThat(result.calorieRemaining()).isEqualTo(500);
        assertThat(result.carb().percentage()).isEqualTo(120);
        assertThat(result.protein().percentage()).isEqualTo(50);
        assertThat(result.defaultBudget().homeCooking()).isEqualTo(8000);
    }
}
