package com.bapmeokja.api.menu;

import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.store.NearbyStoreService;
import com.bapmeokja.api.store.StoreDtos;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/v1/menu")
@RequiredArgsConstructor
public class MenuController {
    private final MenuService menuService;
    private final NearbyStoreService nearbyStoreService;

    @GetMapping("/recommend/summary")
    public ApiResponse<MenuDtos.RecommendationSummary> getSummary() {
        return ApiResponse.success(menuService.getSummary(), "조회 성공");
    }

    @GetMapping("/recommend/dining-out")
    public ApiResponse<MenuDtos.DiningRecommendationResponse> recommendDiningOut(
            @RequestParam(required = false) Integer budget
    ) {
        return ApiResponse.success(menuService.recommendDiningOut(budget), "추천 완료");
    }

    @GetMapping("/categories/{categoryId}/items")
    public ApiResponse<MenuDtos.CategoryItemsResponse> getCategoryItems(
            @PathVariable String categoryId,
            @RequestParam(required = false) Integer budget
    ) {
        return ApiResponse.success(menuService.getCategoryItems(categoryId, budget), "조회 성공");
    }

    @GetMapping("/items/{itemId}")
    public ApiResponse<MenuDtos.MenuItemDetail> getItem(@PathVariable String itemId) {
        return ApiResponse.success(menuService.getItem(itemId), "조회 성공");
    }

    @GetMapping("/nearby-stores")
    public ApiResponse<StoreDtos.NearbyStoresResponse> getNearbyStores(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") double lat,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") double lng,
            @RequestParam String categoryId,
            @RequestParam(defaultValue = "500") @Min(1) @Max(5000) int radius
    ) {
        return ApiResponse.success(
                nearbyStoreService.getNearby(lat, lng, categoryId, radius),
                "조회 성공"
        );
    }
}
