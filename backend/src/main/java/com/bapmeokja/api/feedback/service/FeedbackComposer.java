package com.bapmeokja.api.feedback.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class FeedbackComposer {

    public Narrative compose(
            String periodLabel,
            int calorieConsumed,
            int calorieGoal,
            int carbPercentage,
            int proteinPercentage,
            int fatPercentage
    ) {
        String calorieComment = calorieComment(periodLabel, calorieConsumed, calorieGoal);
        String nutritionComment = nutritionComment(carbPercentage, proteinPercentage, fatPercentage);
        List<String> suggestions = suggestions(carbPercentage, proteinPercentage, fatPercentage);
        String overall = overallFeedback(
                calorieConsumed,
                calorieGoal,
                carbPercentage,
                proteinPercentage,
                fatPercentage
        );
        return new Narrative(calorieComment, nutritionComment, suggestions, overall);
    }

    private String calorieComment(String periodLabel, int consumed, int goal) {
        int difference = consumed - goal;
        if (difference < -Math.round(goal * 0.1)) {
            return periodLabel + " 목표 칼로리보다 " + Math.abs(difference) + "kcal 부족하게 섭취했습니다.";
        }
        if (difference > Math.round(goal * 0.1)) {
            return periodLabel + " 목표 칼로리보다 " + difference + "kcal 많이 섭취했습니다.";
        }
        return periodLabel + " 목표 칼로리에 알맞게 섭취했습니다.";
    }

    private String nutritionComment(int carb, int protein, int fat) {
        List<String> low = new ArrayList<>();
        List<String> high = new ArrayList<>();
        addStatus("탄수화물", carb, low, high);
        addStatus("단백질", protein, low, high);
        addStatus("지방", fat, low, high);

        if (low.isEmpty() && high.isEmpty()) {
            return "탄수화물, 단백질, 지방을 목표 범위에 맞게 고르게 섭취했습니다.";
        }
        if (!low.isEmpty() && !high.isEmpty()) {
            return String.join("·", low) + "은 부족하고 " + String.join("·", high) + "은 많은 편입니다.";
        }
        if (!low.isEmpty()) {
            return String.join("·", low) + " 섭취가 부족합니다.";
        }
        return String.join("·", high) + " 섭취가 많은 편입니다.";
    }

    private void addStatus(String name, int percentage, List<String> low, List<String> high) {
        if (percentage < 80) {
            low.add(name);
        } else if (percentage > 120) {
            high.add(name);
        }
    }

    private List<String> suggestions(int carb, int protein, int fat) {
        List<NutrientGap> gaps = List.of(
                new NutrientGap("탄수화물", carb, "현미밥, 고구마, 통곡물처럼 천천히 소화되는 탄수화물을 식사에 더해보세요."),
                new NutrientGap("단백질", protein, "닭가슴살, 두부, 달걀, 그릭 요거트 등 단백질 식품을 매끼 포함해보세요."),
                new NutrientGap("지방", fat, "견과류, 아보카도, 올리브유 같은 불포화지방을 적당량 더해보세요.")
        );
        List<String> result = gaps.stream()
                .filter(gap -> gap.percentage() < 80)
                .sorted(Comparator.comparingInt(NutrientGap::percentage))
                .limit(2)
                .map(NutrientGap::suggestion)
                .toList();
        if (!result.isEmpty()) {
            return result;
        }

        Map<String, Integer> high = Map.of("탄수화물", carb, "단백질", protein, "지방", fat);
        return high.entrySet().stream()
                .filter(entry -> entry.getValue() > 120)
                .max(Map.Entry.comparingByValue())
                .map(entry -> List.of(
                        entry.getKey() + " 양을 한 번에 줄이기보다 다음 식사부터 조금씩 조절해보세요."
                ))
                .orElseGet(() -> List.of("현재 식사 균형을 유지하면서 채소와 물도 충분히 챙겨보세요."));
    }

    private String overallFeedback(int calories, int goal, int carb, int protein, int fat) {
        int lowest = Math.min(carb, Math.min(protein, fat));
        if (lowest < 80) {
            String nutrient = lowest == protein ? "단백질" : lowest == carb ? "탄수화물" : "지방";
            return nutrient + " 섭취가 가장 부족합니다. 다음 식사에서 해당 영양소를 먼저 보충해보세요.";
        }
        int highest = Math.max(carb, Math.max(protein, fat));
        if (highest > 120 || calories > goal * 1.1) {
            return "전체 섭취량이 목표보다 높습니다. 다음 식사는 양을 조금 줄이고 가볍게 구성해보세요.";
        }
        return "전체 칼로리와 탄단지 균형이 좋습니다. 지금의 식사 패턴을 꾸준히 이어가보세요.";
    }

    private record NutrientGap(String name, int percentage, String suggestion) {
    }

    public record Narrative(
            String calorieComment,
            String nutritionComment,
            List<String> suggestions,
            String overallFeedback
    ) {
    }
}
