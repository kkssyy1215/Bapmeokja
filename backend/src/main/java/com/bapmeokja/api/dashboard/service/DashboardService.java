package com.bapmeokja.api.dashboard.service;

import com.bapmeokja.api.common.time.AppTime;
import com.bapmeokja.api.dashboard.dto.DashboardResponse;
import com.bapmeokja.api.dashboard.dto.DashboardResponse.NutrientProgress;
import com.bapmeokja.api.diet.service.DailyNutritionQueryService;
import com.bapmeokja.api.diet.service.DietUserResolver;
import com.bapmeokja.api.diet.service.NutritionCalculator;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.diet.service.NutritionCalculator.NutritionGoals;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DietUserResolver userResolver;
    private final DailyNutritionQueryService dailyNutritionQueryService;
    private final NutritionCalculator nutritionCalculator;

    @Transactional(readOnly = true)
    public DashboardResponse getToday(Long userId) {
        User user = userResolver.resolve(userId);
        LocalDate today = AppTime.today();
        DailyNutritionSummary consumed = dailyNutritionQueryService.summarize(user, today);
        NutritionGoals goals = nutritionCalculator.goalsOf(user);
        int calorieConsumed = nutritionCalculator.roundedInt(consumed.calorie());

        return new DashboardResponse(
                user.getNickname(),
                today,
                nutritionCalculator.tomatoStatus(calorieConsumed, goals.calorie()),
                goals.calorie(),
                calorieConsumed,
                Math.max(goals.calorie() - calorieConsumed, 0),
                Math.max(calorieConsumed - goals.calorie(), 0),
                progress(goals.carb(), consumed.carb()),
                progress(goals.protein(), consumed.protein()),
                progress(goals.fat(), consumed.fat())
        );
    }

    private NutrientProgress progress(int goal, double consumed) {
        return new NutrientProgress(goal, consumed, nutritionCalculator.percentage(consumed, goal));
    }
}
