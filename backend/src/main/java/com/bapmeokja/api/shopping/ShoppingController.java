package com.bapmeokja.api.shopping;

import com.bapmeokja.api.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/menu/recipes")
@RequiredArgsConstructor
public class ShoppingController {
    private final ShoppingService shoppingService;

    @GetMapping("/{recipeId}/shopping-list")
    public ApiResponse<ShoppingDtos.ShoppingListResponse> getShoppingList(@PathVariable String recipeId) {
        return ApiResponse.success(shoppingService.getShoppingList(recipeId), "조회 성공");
    }
}
