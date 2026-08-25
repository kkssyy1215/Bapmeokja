package com.bapmeokja.api.food.config;

import com.bapmeokja.api.food.domain.Food;
import com.bapmeokja.api.food.repository.FoodRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class FoodCatalogInitializer implements ApplicationRunner {

    private final FoodRepository foodRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (foodRepository.count() > 0) {
            return;
        }
        foodRepository.saveAll(List.of(
                food("food_001", "백미밥", 100, 150, 33, 2.6, 0.3, 2, 0),
                food("food_002", "현미밥", 100, 153, 31.5, 2.8, 1.1, 5, 0),
                food("food_003", "달걀", 100, 143, 0.7, 12.6, 9.5, 142, 372),
                food("food_004", "닭가슴살", 100, 165, 0, 31, 3.6, 74, 85),
                food("food_005", "참치 통조림", 100, 116, 0, 25.5, 1.0, 310, 38),
                food("food_006", "채소 샐러드", 100, 30, 5.7, 1.7, 0.4, 43, 0),
                food("food_007", "식빵", 100, 265, 49, 9, 3.5, 490, 0),
                food("food_008", "라면", 120, 500, 79, 10, 16, 1790, 0),
                food("food_009", "삼겹살", 100, 331, 0, 18, 28.6, 44, 72),
                food("food_010", "두부", 100, 84, 2.3, 9.3, 4.7, 8, 0),
                food("food_011", "바나나", 100, 89, 22.8, 1.1, 0.3, 1, 0),
                food("food_012", "그릭 요거트", 100, 97, 3.9, 9, 5, 36, 13)
        ));
    }

    private Food food(
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
        return new Food(
                id,
                name,
                BigDecimal.valueOf(weight),
                BigDecimal.valueOf(calorie),
                BigDecimal.valueOf(carb),
                BigDecimal.valueOf(protein),
                BigDecimal.valueOf(fat),
                BigDecimal.valueOf(sodium),
                BigDecimal.valueOf(cholesterol)
        );
    }
}
