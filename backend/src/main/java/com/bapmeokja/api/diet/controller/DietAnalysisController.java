package com.bapmeokja.api.diet.controller;

import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.diet.dto.AnalyzeDietResponse;
import com.bapmeokja.api.diet.dto.FoodItemDetailResponse;
import com.bapmeokja.api.diet.service.DietAnalysisService;
import com.bapmeokja.api.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "식단 분석")
@RestController
@RequestMapping("/v1/diet")
@RequiredArgsConstructor
public class DietAnalysisController {

    private final DietAnalysisService dietAnalysisService;

    @Operation(summary = "음식 사진 분석")
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AnalyzeDietResponse> analyze(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("image") MultipartFile image
    ) {
        return ApiResponse.success(
                dietAnalysisService.analyze(principal.id(), image),
                "AI 분석이 완료되었습니다."
        );
    }

    @Operation(summary = "분석 음식 항목 상세 조회")
    @GetMapping("/items/{itemId}")
    public ApiResponse<FoodItemDetailResponse> getItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String itemId
    ) {
        return ApiResponse.success(dietAnalysisService.getItem(principal.id(), itemId), "조회 성공");
    }
}
