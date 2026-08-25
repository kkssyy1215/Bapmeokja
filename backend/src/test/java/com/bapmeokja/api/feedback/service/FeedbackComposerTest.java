package com.bapmeokja.api.feedback.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class FeedbackComposerTest {

    private final FeedbackComposer composer = new FeedbackComposer();

    @Test
    void prioritizesTheMostDeficientNutrientInTheOverallFeedback() {
        FeedbackComposer.Narrative narrative = composer.compose("오늘", 1200, 2000, 90, 50, 95);

        assertThat(narrative.calorieComment()).contains("800kcal 부족");
        assertThat(narrative.nutritionComment()).contains("단백질").contains("부족");
        assertThat(narrative.suggestions()).anyMatch(value -> value.contains("닭가슴살"));
        assertThat(narrative.overallFeedback()).startsWith("단백질 섭취가 가장 부족합니다");
    }

    @Test
    void givesMaintenanceFeedbackWhenCaloriesAndMacrosAreBalanced() {
        FeedbackComposer.Narrative narrative = composer.compose("오늘", 1980, 2000, 96, 101, 92);

        assertThat(narrative.calorieComment()).contains("알맞게");
        assertThat(narrative.overallFeedback()).contains("균형이 좋습니다");
    }
}
