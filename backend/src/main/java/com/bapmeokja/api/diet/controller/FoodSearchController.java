package com.bapmeokja.api.diet.controller;

import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.food.dto.FoodSearchResponse;
import com.bapmeokja.api.food.service.FoodSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "음식 데이터")
@RestController
@RequestMapping("/v1/diet/foods")
@RequiredArgsConstructor
public class FoodSearchController {

    private final FoodSearchService foodSearchService;

    @Operation(summary = "수동 기록용 음식 검색")
    @GetMapping("/search")
    public ApiResponse<FoodSearchResponse> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.success(foodSearchService.search(keyword, page, size), "조회 성공");
    }
}
