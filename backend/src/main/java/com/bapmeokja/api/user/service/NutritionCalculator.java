package com.bapmeokja.api.user.service;

import com.bapmeokja.api.user.domain.ActivityLevel;
import com.bapmeokja.api.user.domain.Gender;
import com.bapmeokja.api.user.domain.Goal;
import com.bapmeokja.api.user.domain.NutritionGoals;
import org.springframework.stereotype.Component;

@Component("profileNutritionCalculator")
public class NutritionCalculator {

    public NutritionGoals calculate(
            Gender gender,
            int age,
            double height,
            double weight,
            ActivityLevel activityLevel,
            Goal goal,
            Double skeletalMuscleMass,
            Double bodyFatMass,
            Double bodyFatPercentage
    ) {
        double baseMetabolicRate = 10 * weight + 6.25 * height - 5 * age + (gender == Gender.M ? 5 : -161);
        double goalAdjustment = switch (goal) {
            case LOSE -> -450;
            case MAINTAIN -> 0;
            case GAIN -> 300;
        };
        int minimumCalories = gender == Gender.M ? 1500 : 1200;
        int calorieGoal = roundToHundred(clamp(
                baseMetabolicRate * activityLevel.getMultiplier() + goalAdjustment,
                minimumCalories,
                5000
        ));

        boolean preciseMode = skeletalMuscleMass != null
                && bodyFatMass != null
                && bodyFatPercentage != null;

        int fatGoal = Math.max(30, (int) Math.round(calorieGoal * 0.25 / 9));
        int proteinGoal;
        int carbGoal;
        if (preciseMode) {
            double leanBodyMass = Math.max(1, weight * (1 - bodyFatPercentage / 100));
            double proteinMultiplier = switch (goal) {
                case LOSE -> 2.35;
                case MAINTAIN -> 2.1;
                case GAIN -> 2.25;
            };
            proteinGoal = Math.max(40, (int) Math.round(leanBodyMass * proteinMultiplier));
            carbGoal = Math.max(50, (int) Math.floor((calorieGoal - proteinGoal * 4.0 - fatGoal * 9.0) / 4.0));
        } else {
            proteinGoal = Math.max(40, (int) Math.round(calorieGoal * 0.25 / 4));
            carbGoal = Math.max(50, (int) Math.round(calorieGoal * 0.50 / 4));
        }

        return new NutritionGoals(calorieGoal, carbGoal, proteinGoal, fatGoal, preciseMode);
    }

    private double clamp(double value, double minimum, double maximum) {
        return Math.max(minimum, Math.min(maximum, value));
    }

    private int roundToHundred(double value) {
        return (int) Math.round(value / 100.0) * 100;
    }
}
