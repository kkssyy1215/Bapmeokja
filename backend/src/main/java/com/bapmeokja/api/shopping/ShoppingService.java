package com.bapmeokja.api.shopping;

import com.bapmeokja.api.fridge.FridgeIngredient;
import com.bapmeokja.api.fridge.FridgeIngredientRepository;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.recipe.Recipe;
import com.bapmeokja.api.recipe.RecipeIngredient;
import com.bapmeokja.api.recipe.RecipeIngredientRepository;
import com.bapmeokja.api.recipe.RecipeService;
import com.bapmeokja.api.user.domain.User;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShoppingService {
    private static final String DISCLAIMER =
            "외부 쇼핑몰로 이동합니다. 상품 정보 및 가격은 쇼핑몰에 따라 달라질 수 있습니다.";

    private final RecipeService recipeService;
    private final RecipeIngredientRepository ingredientRepository;
    private final FridgeIngredientRepository fridgeRepository;
    private final CurrentUserProvider currentUserProvider;

    public ShoppingDtos.ShoppingListResponse getShoppingList(String recipeId) {
        User user = currentUserProvider.get();
        Recipe recipe = recipeService.findRecipe(recipeId);
        List<RecipeIngredient> ingredients = ingredientRepository.findByRecipeIdOrderByIdAsc(recipeId);
        Set<String> fridgeNames = fridgeRepository
                .findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(user.getId())
                .stream()
                .map(FridgeIngredient::getName)
                .map(this::normalize)
                .collect(Collectors.toSet());
        long missingCount = ingredients.stream()
                .filter(ingredient -> !fridgeNames.contains(normalize(ingredient.getName())))
                .count();
        int estimatedTotalCost = estimateMissingIngredientCost(
                recipe.getEstimatedCost(),
                ingredients.size(),
                missingCount
        );
        int estimatedUnitCost = missingCount == 0
                ? 0
                : Math.max(1, Math.round((float) estimatedTotalCost / missingCount));

        List<ShoppingDtos.ShoppingItem> items = ingredients.stream()
                .map(ingredient -> {
                    boolean inFridge = fridgeNames.contains(normalize(ingredient.getName()));
                    return new ShoppingDtos.ShoppingItem(
                            ingredient.getName(),
                            ingredient.getAmount(),
                            inFridge,
                            inFridge ? List.of() : productLinks(ingredient.getName(), estimatedUnitCost)
                    );
                })
                .toList();
        return new ShoppingDtos.ShoppingListResponse(
                recipe.getId(),
                recipe.getName(),
                estimatedTotalCost,
                items,
                DISCLAIMER
        );
    }

    private int estimateMissingIngredientCost(int recipeCost, int ingredientCount, long missingCount) {
        if (recipeCost <= 0 || ingredientCount == 0 || missingCount == 0) {
            return 0;
        }
        return (int) Math.round(recipeCost * (missingCount / (double) ingredientCount));
    }

    private List<ShoppingDtos.Product> productLinks(String ingredientName, int estimatedPrice) {
        String keyword = URLEncoder.encode(ingredientName, StandardCharsets.UTF_8);
        return List.of(
                new ShoppingDtos.Product(
                        "네이버쇼핑",
                        ingredientName + " 상품 보기",
                        estimatedPrice,
                        "https://search.shopping.naver.com/search/all?query=" + keyword
                ),
                new ShoppingDtos.Product(
                        "쿠팡",
                        ingredientName + " 상품 보기",
                        estimatedPrice,
                        "https://www.coupang.com/np/search?q=" + keyword
                )
        );
    }

    private String normalize(String value) {
        return value.replaceAll("\\s+", "").toLowerCase(Locale.KOREAN);
    }
}
