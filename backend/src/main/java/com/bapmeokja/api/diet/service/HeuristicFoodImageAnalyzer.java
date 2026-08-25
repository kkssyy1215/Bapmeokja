package com.bapmeokja.api.diet.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class HeuristicFoodImageAnalyzer implements FoodImageAnalyzer {

    @Override
    public ImageAnalysisResult analyze(MultipartFile image) {
        String filename = image.getOriginalFilename() == null
                ? ""
                : image.getOriginalFilename().toLowerCase(Locale.ROOT);

        if (containsAny(filename, "salad", "샐러드")) {
            return new ImageAnalysisResult("닭가슴살 샐러드", List.of(
                    food("food_004", "닭가슴살", 120, 198, 0, 37.2, 4.3, 89, 102),
                    food("food_006", "채소 샐러드", 150, 45, 8.5, 2.5, 0.6, 65, 0)
            ));
        }
        if (containsAny(filename, "sandwich", "샌드위치", "toast", "토스트")) {
            return new ImageAnalysisResult("달걀 샌드위치", List.of(
                    food("food_007", "식빵", 80, 212, 39.2, 7.2, 2.8, 392, 0),
                    food("food_003", "달걀", 100, 143, 0.7, 12.6, 9.5, 142, 372)
            ));
        }
        if (containsAny(filename, "ramen", "noodle", "라면", "국수", "면")) {
            return new ImageAnalysisResult("채소 라면", List.of(
                    food("food_008", "라면", 120, 500, 79, 10, 16, 1790, 0),
                    food("food_006", "채소", 70, 21, 4, 1.2, 0.2, 30, 0)
            ));
        }
        if (containsAny(filename, "chicken", "닭", "protein")) {
            return new ImageAnalysisResult("닭가슴살 현미밥", List.of(
                    food("food_004", "닭가슴살", 150, 248, 0, 46.5, 5.4, 111, 128),
                    food("food_002", "현미밥", 180, 275, 56.7, 5.0, 2.0, 9, 0)
            ));
        }
        if (containsAny(filename, "rice", "bap", "밥", "덮밥")) {
            return new ImageAnalysisResult("참치 채소 덮밥", List.of(
                    food("food_001", "백미밥", 200, 300, 66, 5.2, 0.6, 4, 0),
                    food("food_005", "참치", 100, 116, 0, 25.5, 1.0, 310, 38),
                    food("food_006", "채소", 80, 24, 4.8, 1.4, 0.2, 34, 0)
            ));
        }

        // 외부 비전 모델 키가 없는 개발·로컬 환경에서도 기록 기능이 막히지 않도록
        // 보편적인 한 끼 구성을 제시하고 사용자가 저장 전에 이름과 영양값을 고칠 수 있게 한다.
        return new ImageAnalysisResult("한 끼 식사", List.of(
                food("food_001", "밥", 180, 270, 59.4, 4.7, 0.5, 4, 0),
                food("food_003", "달걀", 50, 72, 0.4, 6.3, 4.8, 71, 186),
                food("food_006", "채소 반찬", 100, 35, 6.5, 2.0, 0.5, 180, 0)
        ));
    }

    private boolean containsAny(String value, String... keywords) {
        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private DetectedFood food(
            String id,
            String name,
            double weight,
            double calorie,
            double carb,
            double protein,
            double fat,
            double sodium,
            double cholesterol
    ) {
        return new DetectedFood(
                id,
                name,
                decimal(weight),
                decimal(calorie),
                decimal(carb),
                decimal(protein),
                decimal(fat),
                decimal(sodium),
                decimal(cholesterol)
        );
    }

    private BigDecimal decimal(double value) {
        return BigDecimal.valueOf(value);
    }
}
