package com.bapmeokja.api.shopping;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.fridge.FridgeIngredient;
import com.bapmeokja.api.fridge.FridgeIngredientRepository;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.recipe.Recipe;
import com.bapmeokja.api.recipe.RecipeIngredient;
import com.bapmeokja.api.recipe.RecipeIngredientRepository;
import com.bapmeokja.api.recipe.RecipeService;
import com.bapmeokja.api.user.domain.User;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ShoppingServiceTest {
    private RecipeService recipeService;
    private RecipeIngredientRepository ingredientRepository;
    private FridgeIngredientRepository fridgeRepository;
    private CurrentUserProvider currentUserProvider;
    private ShoppingService shoppingService;
    private User user;
    private Recipe recipe;

    @BeforeEach
    void setUp() {
        recipeService = mock(RecipeService.class);
        ingredientRepository = mock(RecipeIngredientRepository.class);
        fridgeRepository = mock(FridgeIngredientRepository.class);
        currentUserProvider = mock(CurrentUserProvider.class);
        shoppingService = new ShoppingService(
                recipeService,
                ingredientRepository,
                fridgeRepository,
                currentUserProvider
        );

        user = mock(User.class);
        recipe = mock(Recipe.class);
        when(user.getId()).thenReturn(1L);
        when(currentUserProvider.get()).thenReturn(user);
        when(recipeService.findRecipe("rec_1")).thenReturn(recipe);
        when(recipe.getId()).thenReturn("rec_1");
        when(recipe.getName()).thenReturn("닭가슴살 볶음밥");
        when(recipe.getEstimatedCost()).thenReturn(12_000);
    }

    @Test
    void estimatesOnlyIngredientsMissingFromFridge() {
        RecipeIngredient chicken = ingredient("닭가슴살", "150g");
        RecipeIngredient rice = ingredient("밥", "1공기");
        RecipeIngredient onion = ingredient("양파", "1/2개");
        FridgeIngredient storedRice = mock(FridgeIngredient.class);
        when(storedRice.getName()).thenReturn(" 밥 ");
        when(ingredientRepository.findByRecipeIdOrderByIdAsc("rec_1"))
                .thenReturn(List.of(chicken, rice, onion));
        when(fridgeRepository.findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(1L))
                .thenReturn(List.of(storedRice));

        ShoppingDtos.ShoppingListResponse result = shoppingService.getShoppingList("rec_1");

        assertThat(result.estimatedTotalCost()).isEqualTo(8_000);
        assertThat(result.shoppingItems()).hasSize(3);
        assertThat(result.shoppingItems())
                .filteredOn(ShoppingDtos.ShoppingItem::inFridge)
                .singleElement()
                .satisfies(item -> assertThat(item.products()).isEmpty());
        assertThat(result.shoppingItems())
                .filteredOn(item -> !item.inFridge())
                .allSatisfy(item -> assertThat(item.products()).isNotEmpty());
    }

    @Test
    void estimatesZeroWhenAllIngredientsAreAlreadyStored() {
        RecipeIngredient rice = ingredient("밥", "1공기");
        FridgeIngredient storedRice = mock(FridgeIngredient.class);
        when(storedRice.getName()).thenReturn("밥");
        when(ingredientRepository.findByRecipeIdOrderByIdAsc("rec_1"))
                .thenReturn(List.of(rice));
        when(fridgeRepository.findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(1L))
                .thenReturn(List.of(storedRice));

        ShoppingDtos.ShoppingListResponse result = shoppingService.getShoppingList("rec_1");

        assertThat(result.estimatedTotalCost()).isZero();
        assertThat(result.shoppingItems().get(0).products()).isEmpty();
    }

    private RecipeIngredient ingredient(String name, String amount) {
        RecipeIngredient ingredient = mock(RecipeIngredient.class);
        when(ingredient.getName()).thenReturn(name);
        when(ingredient.getAmount()).thenReturn(amount);
        return ingredient;
    }
}
