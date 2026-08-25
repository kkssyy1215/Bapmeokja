package com.bapmeokja.api.feedback.service;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.diet.service.DietUserResolver;
import com.bapmeokja.api.diet.service.NutritionCalculator;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.diet.service.NutritionCalculator.NutritionGoals;
import com.bapmeokja.api.diet.service.NutritionPeriodQueryService;
import com.bapmeokja.api.diet.service.NutritionPeriodQueryService.PeriodNutritionSummary;
import com.bapmeokja.api.feedback.dto.FeedbackResponse;
import com.bapmeokja.api.feedback.dto.FeedbackResponse.AggregateCalorieAnalysis;
import com.bapmeokja.api.feedback.dto.FeedbackResponse.AggregateNutritionBalance;
import com.bapmeokja.api.feedback.dto.FeedbackResponse.DailyCalorieAnalysis;
import com.bapmeokja.api.feedback.dto.FeedbackResponse.DailyNutritionBalance;
import com.bapmeokja.api.feedback.dto.PeriodType;
import com.bapmeokja.api.feedback.service.FeedbackComposer.Narrative;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalDate;
import java.time.YearMonth;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final DietUserResolver userResolver;
    private final NutritionPeriodQueryService periodQueryService;
    private final NutritionCalculator nutritionCalculator;
    private final FeedbackComposer feedbackComposer;

    @Transactional(readOnly = true)
    public FeedbackResponse daily(Long userId, LocalDate date) {
        User user = userResolver.resolve(userId);
        NutritionGoals goals = nutritionCalculator.goalsOf(user);
        PeriodNutritionSummary period = periodQueryService.summarize(user, date, date.plusDays(1));
        requireRecords(period);
        DailyNutritionSummary consumed = period.daily().get(date);
        int calorie = nutritionCalculator.roundedInt(consumed.calorie());
        int carb = nutritionCalculator.percentage(consumed.carb(), goals.carb());
        int protein = nutritionCalculator.percentage(consumed.protein(), goals.protein());
        int fat = nutritionCalculator.percentage(consumed.fat(), goals.fat());
        Narrative narrative = feedbackComposer.compose("오늘", calorie, goals.calorie(), carb, protein, fat);

        return new FeedbackResponse(
                date.toString(),
                PeriodType.DAILY,
                new DailyCalorieAnalysis(calorie, goals.calorie(), narrative.calorieComment()),
                new DailyNutritionBalance(carb, protein, fat, narrative.nutritionComment()),
                narrative.suggestions(),
                narrative.overallFeedback()
        );
    }

    @Transactional(readOnly = true)
    public FeedbackResponse weekly(Long userId, LocalDate startDate) {
        User user = userResolver.resolve(userId);
        LocalDate endDate = startDate.plusDays(6);
        PeriodNutritionSummary period = periodQueryService.summarize(user, startDate, endDate.plusDays(1));
        return aggregate(
                period,
                nutritionCalculator.goalsOf(user),
                startDate + " ~ " + endDate,
                PeriodType.WEEKLY,
                "이번 주"
        );
    }

    @Transactional(readOnly = true)
    public FeedbackResponse monthly(Long userId, int year, int month) {
        validateYearMonth(year, month);
        User user = userResolver.resolve(userId);
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        PeriodNutritionSummary period = periodQueryService.summarize(user, startDate, endDate.plusDays(1));
        return aggregate(
                period,
                nutritionCalculator.goalsOf(user),
                startDate + " ~ " + endDate,
                PeriodType.MONTHLY,
                "이번 달"
        );
    }

    private FeedbackResponse aggregate(
            PeriodNutritionSummary period,
            NutritionGoals goals,
            String periodText,
            PeriodType periodType,
            String periodLabel
    ) {
        requireRecords(period);
        int avgCalorie = nutritionCalculator.roundedInt(period.averageCalorie());
        int avgCarb = nutritionCalculator.percentage(period.averageCarb(), goals.carb());
        int avgProtein = nutritionCalculator.percentage(period.averageProtein(), goals.protein());
        int avgFat = nutritionCalculator.percentage(period.averageFat(), goals.fat());
        Narrative narrative = feedbackComposer.compose(
                periodLabel + " 평균",
                avgCalorie,
                goals.calorie(),
                avgCarb,
                avgProtein,
                avgFat
        );
        return new FeedbackResponse(
                periodText,
                periodType,
                new AggregateCalorieAnalysis(avgCalorie, goals.calorie(), narrative.calorieComment()),
                new AggregateNutritionBalance(
                        avgCarb,
                        avgProtein,
                        avgFat,
                        narrative.nutritionComment()
                ),
                narrative.suggestions(),
                narrative.overallFeedback()
        );
    }

    private void requireRecords(PeriodNutritionSummary period) {
        if (period.totalRecordCount() == 0) {
            throw new BusinessException(
                    ErrorCode.RESOURCE_NOT_FOUND,
                    "해당 기간에 분석할 식단 기록이 없습니다."
            );
        }
    }

    private void validateYearMonth(int year, int month) {
        if (year < 2000 || year > 2100 || month < 1 || month > 12) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "연도와 월의 범위를 확인해주세요.");
        }
    }
}
