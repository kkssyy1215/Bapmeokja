package com.bapmeokja.api.diet.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.bapmeokja.api.dashboard.dto.TomatoStatus;
import com.bapmeokja.api.diet.domain.DietRecord;
import com.bapmeokja.api.diet.domain.DietRecordItem;
import com.bapmeokja.api.diet.domain.MealType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class NutritionCalculatorTest {

    private final NutritionCalculator calculator = new NutritionCalculator();

    @Test
    void sumsEveryDietRecordFromPersistedNutritionValues() {
        DietRecord breakfast = record("rec_1", 400, 50, 25, 12);
        DietRecord lunch = record("rec_2", 650, 80, 40, 20);

        NutritionCalculator.DailyNutritionSummary result = calculator.summarize(List.of(breakfast, lunch));

        assertThat(result.calorie()).isEqualTo(1050.0);
        assertThat(result.carb()).isEqualTo(130.0);
        assertThat(result.protein()).isEqualTo(65.0);
        assertThat(result.fat()).isEqualTo(32.0);
        assertThat(result.recordCount()).isEqualTo(2);
    }

    @Test
    void mapsCalorieRatioToThreeTomatoStates() {
        assertThat(calculator.tomatoStatus(1500, 2000)).isEqualTo(TomatoStatus.HUNGRY);
        assertThat(calculator.tomatoStatus(1800, 2000)).isEqualTo(TomatoStatus.NORMAL);
        assertThat(calculator.tomatoStatus(2001, 2000)).isEqualTo(TomatoStatus.OVEREATEN);
    }

    @Test
    void percentageCanExceedOneHundred() {
        assertThat(calculator.percentage(375, 250)).isEqualTo(150);
    }

    private DietRecord record(String id, double calorie, double carb, double protein, double fat) {
        DietRecord record = new DietRecord(id, null, null, MealType.LUNCH, Instant.now(), null);
        record.addItem(new DietRecordItem(
                "food_1",
                "테스트 식단",
                BigDecimal.valueOf(200),
                BigDecimal.valueOf(calorie),
                BigDecimal.valueOf(carb),
                BigDecimal.valueOf(protein),
                BigDecimal.valueOf(fat),
                BigDecimal.ZERO,
                BigDecimal.ZERO
        ));
        return record;
    }
}
