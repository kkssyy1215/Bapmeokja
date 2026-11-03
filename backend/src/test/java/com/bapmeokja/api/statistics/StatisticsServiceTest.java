package com.bapmeokja.api.statistics;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.diet.service.DietUserResolver;
import com.bapmeokja.api.diet.service.NutritionCalculator;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.diet.service.NutritionPeriodQueryService;
import com.bapmeokja.api.diet.service.NutritionPeriodQueryService.PeriodNutritionSummary;
import com.bapmeokja.api.statistics.dto.DailyStatisticsResponse;
import com.bapmeokja.api.statistics.dto.MonthlyStatisticsResponse;
import com.bapmeokja.api.statistics.dto.WeeklyStatisticsResponse;
import com.bapmeokja.api.statistics.service.StatisticsService;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class StatisticsServiceTest {
    private static final DailyNutritionSummary EMPTY = new DailyNutritionSummary(0, 0, 0, 0, 0);

    private NutritionPeriodQueryService periodQueryService;
    private StatisticsService service;

    @BeforeEach
    void setUp() {
        DietUserResolver userResolver = mock(DietUserResolver.class);
        periodQueryService = mock(NutritionPeriodQueryService.class);
        User user = mock(User.class);
        when(userResolver.resolve(1L)).thenReturn(user);
        when(user.getDailyCalorieGoal()).thenReturn(2000);
        when(user.getCarbGoalGram()).thenReturn(250);
        when(user.getProteinGoalGram()).thenReturn(100);
        when(user.getFatGoalGram()).thenReturn(50);
        service = new StatisticsService(userResolver, periodQueryService, new NutritionCalculator());
    }

    @Test
    void dailyStatisticsComparesConsumedNutritionWithGoals() {
        LocalDate date = LocalDate.of(2026, 10, 14);
        stubPeriod(date, 1, Map.of(date, new DailyNutritionSummary(1500, 200, 50, 60, 3)));

        DailyStatisticsResponse result = service.daily(1L, date);

        assertThat(result.calorieConsumed()).isEqualTo(1500);
        assertThat(result.caloriePercentage()).isEqualTo(75);
        assertThat(result.protein().percentage()).isEqualTo(50);
        assertThat(result.fat().percentage()).isEqualTo(120);
    }

    @Test
    void weeklyStatisticsReturnsSevenDaysAndAveragesOnlyRecordedDays() {
        LocalDate monday = LocalDate.of(2026, 10, 12);
        stubPeriod(monday, 7, Map.of(
                monday, new DailyNutritionSummary(1800, 0, 0, 0, 2),
                monday.plusDays(2), new DailyNutritionSummary(2200, 0, 0, 0, 3)
        ));

        WeeklyStatisticsResponse result = service.weekly(1L, monday);

        assertThat(result.daily()).hasSize(7);
        assertThat(result.endDate()).isEqualTo(monday.plusDays(6));
        assertThat(result.daily().get(1).calorieConsumed()).isZero();
        // 기록이 없는 날은 평균에서 제외: (1800 + 2200) / 2
        assertThat(result.weeklyAvgCalorie()).isEqualTo(2000);
    }

    @Test
    void monthlyStatisticsCoversEveryDayOfTheMonth() {
        LocalDate first = LocalDate.of(2026, 2, 1);
        stubPeriod(first, 28, Map.of(first, new DailyNutritionSummary(1000, 125, 50, 25, 1)));

        MonthlyStatisticsResponse result = service.monthly(1L, 2026, 2);

        assertThat(result.daily()).hasSize(28);
        assertThat(result.monthlyAvgCarbPercentage()).isEqualTo(50);
    }

    @Test
    void monthlyStatisticsRejectsOutOfRangeMonth() {
        assertThatThrownBy(() -> service.monthly(1L, 2026, 13)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> service.monthly(1L, 1999, 1)).isInstanceOf(BusinessException.class);
    }

    // 회귀 테스트(BUG-008): DB가 표현할 수 없는 날짜는 조회 전에 입력 오류로 처리한다.
    @Test
    void outOfRangeDatesAreRejectedBeforeQuerying() {
        assertThatThrownBy(() -> service.weekly(1L, LocalDate.of(9999, 12, 31))).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> service.daily(1L, LocalDate.of(1, 1, 1))).isInstanceOf(BusinessException.class);
    }

    private void stubPeriod(LocalDate start, int days, Map<LocalDate, DailyNutritionSummary> recorded) {
        Map<LocalDate, DailyNutritionSummary> daily = new LinkedHashMap<>();
        start.datesUntil(start.plusDays(days)).forEach(date -> daily.put(date, recorded.getOrDefault(date, EMPTY)));
        when(periodQueryService.summarize(any(), any(), any()))
                .thenReturn(new PeriodNutritionSummary(start, start.plusDays(days), daily));
    }
}
