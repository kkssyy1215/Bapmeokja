package com.bapmeokja.api.diet.service;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface FoodImageAnalyzer {

    ImageAnalysisResult analyze(MultipartFile image);

    record ImageAnalysisResult(String foodName, List<DetectedFood> items) {
    }

    record DetectedFood(
            String foodId,
            String name,
            BigDecimal weightGram,
            BigDecimal calorie,
            BigDecimal carb,
            BigDecimal protein,
            BigDecimal fat,
            BigDecimal sodium,
            BigDecimal cholesterol
    ) {
    }
}
