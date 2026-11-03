package com.bapmeokja.api.statistics.service;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.common.time.AppTime;
import com.bapmeokja.api.diet.service.DietUserResolver;
import com.bapmeokja.api.diet.service.NutritionCalculator;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.diet.service.NutritionCalculator.NutritionGoals;
import com.bapmeokja.api.diet.service.NutritionPeriodQueryService;
import com.bapmeokja.api.diet.service.NutritionPeriodQueryService.PeriodNutritionSummary;
import com.bapmeokja.api.statistics.dto.DailyStatisticsResponse;
import com.bapmeokja.api.statistics.dto.DailyStatisticsResponse.NutrientProgress;
import com.bapmeokja.api.statistics.dto.MonthlyStatisticsResponse;
import com.bapmeokja.api.statistics.dto.WeeklyStatisticsResponse;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final DietUserResolver userResolver;
    private final NutritionPeriodQueryService periodQueryService;
    private final NutritionCalculator nutritionCalculator;

    @Transactional(readOnly = true)
    public DailyStatisticsResponse daily(Long userId, LocalDate date) {
        AppTime.requireSupportedDate(date);
        User user = userResolver.resolve(userId);
        NutritionGoals goals = nutritionCalculator.goalsOf(user);
        DailyNutritionSummary consumed = periodQueryService
                .summarize(user, date, date.plusDays(1))
                .daily()
                .get(date);
        int calorie = nutritionCalculator.roundedInt(consumed.calorie());
        return new DailyStatisticsResponse(
                date,
                goals.calorie(),
                calorie,
                nutritionCalculator.percentage(calorie, goals.calorie()),
                progress(goals.carb(), consumed.carb()),
                progress(goals.protein(), consumed.protein()),
                progress(goals.fat(), consumed.fat())
        );
    }

    @Transactional(readOnly = true)
    public WeeklyStatisticsResponse weekly(Long userId, LocalDate startDate) {
        AppTime.requireSupportedDate(startDate);
        User user = userResolver.resolve(userId);
        NutritionGoals goals = nutritionCalculator.goalsOf(user);
        LocalDate endExclusive = startDate.plusDays(7);
        PeriodNutritionSummary period = periodQueryService.summarize(user, startDate, endExclusive);
        List<WeeklyStatisticsResponse.DailyPoint> daily = startDate.datesUntil(endExclusive)
                .map(date -> weeklyPoint(date, period.daily().get(date), goals))
                .toList();
        return new WeeklyStatisticsResponse(
                startDate,
                endExclusive.minusDays(1),
                daily,
                nutritionCalculator.roundedInt(period.averageCalorie())
        );
    }

    @Transactional(readOnly = true)
    public MonthlyStatisticsResponse monthly(Long userId, int year, int month) {
        validateYearMonth(year, month);
        User user = userResolver.resolve(userId);
        NutritionGoals goals = nutritionCalculator.goalsOf(user);
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate endExclusive = yearMonth.plusMonths(1).atDay(1);
        PeriodNutritionSummary period = periodQueryService.summarize(user, start, endExclusive);
        List<MonthlyStatisticsResponse.DailyPoint> daily = start.datesUntil(endExclusive)
                .map(date -> new MonthlyStatisticsResponse.DailyPoint(
                        date,
                        nutritionCalculator.roundedInt(period.daily().get(date).calorie()),
                        goals.calorie()
                ))
                .toList();
        return new MonthlyStatisticsResponse(
                year,
                month,
                daily,
                nutritionCalculator.roundedInt(period.averageCalorie()),
                nutritionCalculator.percentage(period.averageCarb(), goals.carb()),
                nutritionCalculator.percentage(period.averageProtein(), goals.protein()),
                nutritionCalculator.percentage(period.averageFat(), goals.fat())
        );
    }

    private WeeklyStatisticsResponse.DailyPoint weeklyPoint(
            LocalDate date,
            DailyNutritionSummary day,
            NutritionGoals goals
    ) {
        return new WeeklyStatisticsResponse.DailyPoint(
                date,
                nutritionCalculator.roundedInt(day.calorie()),
                goals.calorie(),
                nutritionCalculator.percentage(day.carb(), goals.carb()),
                nutritionCalculator.percentage(day.protein(), goals.protein()),
                nutritionCalculator.percentage(day.fat(), goals.fat())
        );
    }

    private NutrientProgress progress(int goal, double consumed) {
        return new NutrientProgress(goal, consumed, nutritionCalculator.percentage(consumed, goal));
    }

    private void validateYearMonth(int year, int month) {
        if (year < 2000 || year > 2100 || month < 1 || month > 12) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "연도와 월의 범위를 확인해주세요.");
        }
    }
}
