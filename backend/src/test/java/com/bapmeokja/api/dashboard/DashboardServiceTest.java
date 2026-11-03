package com.bapmeokja.api.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.dashboard.dto.DashboardResponse;
import com.bapmeokja.api.dashboard.dto.TomatoStatus;
import com.bapmeokja.api.dashboard.service.DashboardService;
import com.bapmeokja.api.diet.service.DailyNutritionQueryService;
import com.bapmeokja.api.diet.service.DietUserResolver;
import com.bapmeokja.api.diet.service.NutritionCalculator;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.user.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DashboardServiceTest {
    private DailyNutritionQueryService dailyNutritionQueryService;
    private User user;
    private DashboardService service;

    @BeforeEach
    void setUp() {
        DietUserResolver userResolver = mock(DietUserResolver.class);
        dailyNutritionQueryService = mock(DailyNutritionQueryService.class);
        user = mock(User.class);
        when(userResolver.resolve(1L)).thenReturn(user);
        when(user.getNickname()).thenReturn("밥풀");
        service = new DashboardService(userResolver, dailyNutritionQueryService, new NutritionCalculator());
    }

    @Test
    void overeatingShowsExceededCalorieAndOvereatenTomato() {
        goals(2000, 250, 100, 50);
        consumed(new DailyNutritionSummary(2300.4, 300, 80, 70, 4));

        DashboardResponse result = service.getToday(1L);

        assertThat(result.calorieConsumed()).isEqualTo(2300);
        assertThat(result.calorieRemaining()).isZero();
        assertThat(result.calorieExceeded()).isEqualTo(300);
        assertThat(result.tomatoStatus()).isEqualTo(TomatoStatus.OVEREATEN);
        assertThat(result.fat().percentage()).isEqualTo(140);
    }

    @Test
    void lowIntakeShowsRemainingCalorieAndHungryTomato() {
        goals(2000, 250, 100, 50);
        consumed(new DailyNutritionSummary(860, 110, 57, 22, 2));

        DashboardResponse result = service.getToday(1L);

        assertThat(result.calorieRemaining()).isEqualTo(1140);
        assertThat(result.calorieExceeded()).isZero();
        assertThat(result.tomatoStatus()).isEqualTo(TomatoStatus.HUNGRY);
        assertThat(result.protein().percentage()).isEqualTo(57);
    }

    @Test
    void userWithoutGoalsFallsBackToDefaultGoals() {
        goals(null, null, null, null);
        consumed(new DailyNutritionSummary(0, 0, 0, 0, 0));

        DashboardResponse result = service.getToday(1L);

        assertThat(result.calorieGoal()).isEqualTo(2000);
        assertThat(result.carb().goalGram()).isEqualTo(250);
        assertThat(result.calorieRemaining()).isEqualTo(2000);
    }

    private void goals(Integer calorie, Integer carb, Integer protein, Integer fat) {
        when(user.getDailyCalorieGoal()).thenReturn(calorie);
        when(user.getCarbGoalGram()).thenReturn(carb);
        when(user.getProteinGoalGram()).thenReturn(protein);
        when(user.getFatGoalGram()).thenReturn(fat);
    }

    private void consumed(DailyNutritionSummary summary) {
        when(dailyNutritionQueryService.summarize(eq(user), any())).thenReturn(summary);
    }
}
