package com.bapmeokja.api.diet.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class HeuristicFoodImageAnalyzerTest {

    private final HeuristicFoodImageAnalyzer analyzer = new HeuristicFoodImageAnalyzer();

    @Test
    void selectsAUsefulEditableEstimateFromTheFilenameWhenNoExternalAiIsConfigured() {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "today-chicken-salad.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        FoodImageAnalyzer.ImageAnalysisResult result = analyzer.analyze(image);

        assertThat(result.foodName()).isEqualTo("닭가슴살 샐러드");
        assertThat(result.items()).extracting(FoodImageAnalyzer.DetectedFood::name)
                .containsExactly("닭가슴살", "채소 샐러드");
    }

    @Test
    void returnsAGeneralMealInsteadOfBlockingTheUserForAnUnknownImage() {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "IMG_0001.heic",
                "image/heic",
                new byte[]{1}
        );

        FoodImageAnalyzer.ImageAnalysisResult result = analyzer.analyze(image);

        assertThat(result.foodName()).isEqualTo("한 끼 식사");
        assertThat(result.items()).hasSize(3);
    }
}
