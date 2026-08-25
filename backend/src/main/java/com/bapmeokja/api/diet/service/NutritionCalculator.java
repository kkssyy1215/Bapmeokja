package com.bapmeokja.api.diet.service;

import com.bapmeokja.api.dashboard.dto.TomatoStatus;
import com.bapmeokja.api.diet.domain.DietRecord;
import com.bapmeokja.api.user.domain.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import org.springframework.stereotype.Component;

@Component
public class NutritionCalculator {

    public DailyNutritionSummary summarize(Collection<DietRecord> records) {
        BigDecimal calorie = BigDecimal.ZERO;
        BigDecimal carb = BigDecimal.ZERO;
        BigDecimal protein = BigDecimal.ZERO;
        BigDecimal fat = BigDecimal.ZERO;

        for (DietRecord record : records) {
            calorie = calorie.add(record.getTotalCalorie());
            carb = carb.add(record.getTotalCarb());
            protein = protein.add(record.getTotalProtein());
            fat = fat.add(record.getTotalFat());
        }
        return new DailyNutritionSummary(
                rounded(calorie),
                rounded(carb),
                rounded(protein),
                rounded(fat),
                records.size()
        );
    }

    public NutritionGoals goalsOf(User user) {
        return new NutritionGoals(
                positiveOrDefault(user.getDailyCalorieGoal(), 2000),
                positiveOrDefault(user.getCarbGoalGram(), 250),
                positiveOrDefault(user.getProteinGoalGram(), 125),
                positiveOrDefault(user.getFatGoalGram(), 55)
        );
    }

    public int percentage(double consumed, int goal) {
        if (goal <= 0) {
            return 0;
        }
        return (int) Math.round(consumed * 100.0 / goal);
    }

    public TomatoStatus tomatoStatus(int calorieConsumed, int calorieGoal) {
        if (calorieGoal > 0 && calorieConsumed > calorieGoal) {
            return TomatoStatus.OVEREATEN;
        }
        if (calorieGoal > 0 && calorieConsumed < calorieGoal * 0.8) {
            return TomatoStatus.HUNGRY;
        }
        return TomatoStatus.NORMAL;
    }

    public int roundedInt(double value) {
        return (int) Math.round(value);
    }

    private double rounded(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private int positiveOrDefault(Integer value, int fallback) {
        return value == null || value <= 0 ? fallback : value;
    }

    public record DailyNutritionSummary(
            double calorie,
            double carb,
            double protein,
            double fat,
            int recordCount
    ) {
    }

    public record NutritionGoals(int calorie, int carb, int protein, int fat) {
    }
}
