package com.bapmeokja.api.dashboard.controller;

import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.dashboard.dto.DashboardResponse;
import com.bapmeokja.api.dashboard.service.DashboardService;
import com.bapmeokja.api.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "홈")
@RestController
@RequestMapping("/v1/home")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "오늘의 영양 상태 조회")
    @GetMapping("/dashboard")
    public ApiResponse<DashboardResponse> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(dashboardService.getToday(principal.id()), "조회 성공");
    }
}
