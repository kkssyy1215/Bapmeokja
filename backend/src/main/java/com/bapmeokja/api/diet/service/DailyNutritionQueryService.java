package com.bapmeokja.api.diet.service;

import com.bapmeokja.api.common.time.AppTime;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DailyNutritionQueryService {

    private final NutritionPeriodQueryService periodQueryService;

    @Transactional(readOnly = true)
    public DailyNutritionSummary summarize(User user, LocalDate date) {
        return periodQueryService.summarize(user, date, date.plusDays(1)).daily().get(date);
    }

    @Transactional(readOnly = true)
    public DailyNutritionSummary summarizeToday(User user) {
        return summarize(user, AppTime.today());
    }
}
