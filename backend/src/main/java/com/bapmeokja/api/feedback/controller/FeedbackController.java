package com.bapmeokja.api.feedback.controller;

import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.feedback.dto.FeedbackResponse;
import com.bapmeokja.api.feedback.service.FeedbackService;
import com.bapmeokja.api.security.UserPrincipal;
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

@Tag(name = "AI 피드백")
@RestController
@RequestMapping("/v1/ai/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "일일 식단 피드백")
    @GetMapping("/daily")
    public ApiResponse<FeedbackResponse> daily(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.success(feedbackService.daily(principal.id(), date), "AI 피드백 생성 완료");
    }

    @Operation(summary = "주간 식단 피드백")
    @GetMapping("/weekly")
    public ApiResponse<FeedbackResponse> weekly(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate
    ) {
        return ApiResponse.success(
                feedbackService.weekly(principal.id(), startDate),
                "AI 피드백 생성 완료"
        );
    }

    @Operation(summary = "월간 식단 피드백")
    @GetMapping("/monthly")
    public ApiResponse<FeedbackResponse> monthly(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ApiResponse.success(
                feedbackService.monthly(principal.id(), year, month),
                "AI 피드백 생성 완료"
        );
    }
}
