package com.bapmeokja.api.user;

import static org.assertj.core.api.Assertions.assertThat;

import com.bapmeokja.api.user.domain.ActivityLevel;
import com.bapmeokja.api.user.domain.Gender;
import com.bapmeokja.api.user.domain.Goal;
import com.bapmeokja.api.user.domain.NutritionGoals;
import com.bapmeokja.api.user.service.NutritionCalculator;
import org.junit.jupiter.api.Test;

class NutritionCalculatorTest {

    private final NutritionCalculator calculator = new NutritionCalculator();

    @Test
    void calculatesSpecExampleWithPreciseBodyComposition() {
        NutritionGoals goals = calculator.calculate(
                Gender.M,
                25,
                175,
                70,
                ActivityLevel.MODERATE,
                Goal.LOSE,
                32.5,
                14.2,
                20.3
        );

        assertThat(goals.dailyCalorieGoal()).isEqualTo(2100);
        assertThat(goals.carbGoalGram()).isEqualTo(263);
        assertThat(goals.proteinGoalGram()).isEqualTo(131);
        assertThat(goals.fatGoalGram()).isEqualTo(58);
        assertThat(goals.preciseMode()).isTrue();
    }

    @Test
    void disablesPreciseModeWhenAnyBodyCompositionValueIsMissing() {
        NutritionGoals goals = calculator.calculate(
                Gender.F,
                30,
                165,
                58,
                ActivityLevel.LIGHT,
                Goal.MAINTAIN,
                22.0,
                null,
                24.0
        );

        assertThat(goals.preciseMode()).isFalse();
        assertThat(goals.dailyCalorieGoal()).isGreaterThanOrEqualTo(1200);
    }
}
