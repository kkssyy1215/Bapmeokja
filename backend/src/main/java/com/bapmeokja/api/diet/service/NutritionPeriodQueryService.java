package com.bapmeokja.api.diet.service;

import com.bapmeokja.api.common.time.AppTime;
import com.bapmeokja.api.diet.domain.DietRecord;
import com.bapmeokja.api.diet.repository.DietRecordRepository;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.user.domain.User;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NutritionPeriodQueryService {

    private final DietRecordRepository dietRecordRepository;
    private final NutritionCalculator nutritionCalculator;

    @Transactional(readOnly = true)
    public PeriodNutritionSummary summarize(User user, LocalDate startInclusive, LocalDate endExclusive) {
        Instant start = AppTime.startOfDay(startInclusive);
        Instant end = AppTime.startOfDay(endExclusive);
        List<DietRecord> records = dietRecordRepository.findAllWithItemsInPeriod(user.getId(), start, end);
        Map<LocalDate, List<DietRecord>> byDate = records.stream().collect(Collectors.groupingBy(
                record -> AppTime.toLocalDate(record.getEatenAt()),
                LinkedHashMap::new,
                Collectors.toList()
        ));

        Map<LocalDate, DailyNutritionSummary> daily = new LinkedHashMap<>();
        startInclusive.datesUntil(endExclusive).forEach(date -> daily.put(
                date,
                nutritionCalculator.summarize(byDate.getOrDefault(date, List.of()))
        ));
        return new PeriodNutritionSummary(startInclusive, endExclusive, Map.copyOf(daily));
    }

    public record PeriodNutritionSummary(
            LocalDate startInclusive,
            LocalDate endExclusive,
            Map<LocalDate, DailyNutritionSummary> daily
    ) {
        public int totalRecordCount() {
            return daily.values().stream().mapToInt(DailyNutritionSummary::recordCount).sum();
        }

        public int activeDayCount() {
            return (int) daily.values().stream().filter(day -> day.recordCount() > 0).count();
        }

        public double averageCalorie() {
            return average(DailyNutritionSummary::calorie);
        }

        public double averageCarb() {
            return average(DailyNutritionSummary::carb);
        }

        public double averageProtein() {
            return average(DailyNutritionSummary::protein);
        }

        public double averageFat() {
            return average(DailyNutritionSummary::fat);
        }

        private double average(java.util.function.ToDoubleFunction<DailyNutritionSummary> extractor) {
            return daily.values().stream()
                    .filter(day -> day.recordCount() > 0)
                    .mapToDouble(extractor)
                    .average()
                    .orElse(0.0);
        }
    }
}
