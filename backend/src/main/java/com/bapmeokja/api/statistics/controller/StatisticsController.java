package com.bapmeokja.api.statistics.controller;

import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.security.UserPrincipal;
import com.bapmeokja.api.statistics.dto.DailyStatisticsResponse;
import com.bapmeokja.api.statistics.dto.MonthlyStatisticsResponse;
import com.bapmeokja.api.statistics.dto.WeeklyStatisticsResponse;
import com.bapmeokja.api.statistics.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "통계")
@RestController
@RequestMapping("/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @Operation(summary = "일별 통계")
    @GetMapping("/daily")
    public ApiResponse<DailyStatisticsResponse> daily(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.success(statisticsService.daily(principal.id(), date), "조회 성공");
    }

    @Operation(summary = "주별 통계")
    @GetMapping("/weekly")
    public ApiResponse<WeeklyStatisticsResponse> weekly(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate
    ) {
        return ApiResponse.success(statisticsService.weekly(principal.id(), startDate), "조회 성공");
    }

    @Operation(summary = "월별 통계")
    @GetMapping("/monthly")
    public ApiResponse<MonthlyStatisticsResponse> monthly(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ApiResponse.success(statisticsService.monthly(principal.id(), year, month), "조회 성공");
    }
}
