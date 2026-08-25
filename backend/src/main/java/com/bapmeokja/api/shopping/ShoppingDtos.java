package com.bapmeokja.api.shopping;

import java.util.List;

public final class ShoppingDtos {
    private ShoppingDtos() {
    }

    public record ShoppingListResponse(
            String recipeId,
            String recipeName,
            int estimatedTotalCost,
            List<ShoppingItem> shoppingItems,
            String disclaimer
    ) {
    }

    public record ShoppingItem(
            String name,
            String requiredAmount,
            boolean inFridge,
            List<Product> products
    ) {
    }

    public record Product(
            String mallName,
            String productName,
            int price,
            String productUrl
    ) {
    }
}
