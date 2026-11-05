package com.bapmeokja.api.menu;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.diet.service.DailyNutritionQueryService;
import com.bapmeokja.api.diet.service.NutritionCalculator.DailyNutritionSummary;
import com.bapmeokja.api.user.domain.User;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MenuServiceTest {
    private MenuService service;

    @BeforeEach
    void setUp() {
        MenuCategoryRepository categories = mock(MenuCategoryRepository.class);
        MenuItemRepository items = mock(MenuItemRepository.class);
        DailyNutritionQueryService nutrition = mock(DailyNutritionQueryService.class);
        CurrentUserProvider currentUser = mock(CurrentUserProvider.class);
        User user = mock(User.class);
        when(user.getProteinGoalGram()).thenReturn(100);
        when(user.getCarbGoalGram()).thenReturn(100);
        when(user.getFatGoalGram()).thenReturn(100);
        when(currentUser.get()).thenReturn(user);
        DailyNutritionSummary consumed = mock(DailyNutritionSummary.class);
        when(nutrition.summarizeToday(any())).thenReturn(consumed);

        MenuCategory poke = category("poke", "포케");
        MenuCategory snack = category("snack", "간편식");
        when(categories.findAll()).thenReturn(List.of(poke, snack));
        List<MenuItem> pokeItems = List.of(item("menu_1", "닭가슴살 포케", 10900), item("menu_2", "연어 포케", 12900));
        List<MenuItem> snackItems = List.of(item("menu_3", "참치 김밥", 3800), item("menu_4", "닭가슴살 컵밥", 4900));
        when(items.findByCategoryIdOrderByAvgPriceAsc("poke")).thenReturn(pokeItems);
        when(items.findByCategoryIdOrderByAvgPriceAsc("snack")).thenReturn(snackItems);
        service = new MenuService(categories, items, mock(MenuItemIngredientRepository.class), nutrition, currentUser);
    }

    @Test
    void recommendsSpecificMenusWithinTheBudgetCheapestFirst() {
        assertThat(names(5000)).containsExactly("참치 김밥", "닭가슴살 컵밥");
        assertThat(names(11000)).containsExactly("참치 김밥", "닭가슴살 컵밥", "닭가슴살 포케");
        assertThat(names(3000)).isEmpty();
    }

    @Test
    void carriesWhatTheMenuAndStoreScreensNeed() {
        MenuDtos.RecommendedCategory menu = service.recommendDiningOut(11000).recommendedCategories().get(2);

        assertThat(menu.itemId()).isEqualTo("menu_1");
        assertThat(menu.categoryId()).isEqualTo("poke");
        assertThat(menu.estimatedCost()).isEqualTo(10900);
        assertThat(menu.isWithinBudget()).isTrue();
    }

    private List<String> names(int budget) {
        return service.recommendDiningOut(budget).recommendedCategories().stream()
                .map(MenuDtos.RecommendedCategory::menuName)
                .toList();
    }

    private MenuCategory category(String id, String name) {
        MenuCategory category = mock(MenuCategory.class);
        when(category.getId()).thenReturn(id);
        when(category.getName()).thenReturn(name);
        return category;
    }

    private MenuItem item(String id, String name, int price) {
        MenuItem item = mock(MenuItem.class);
        when(item.getId()).thenReturn(id);
        when(item.getName()).thenReturn(name);
        when(item.getAvgPrice()).thenReturn(price);
        return item;
    }
}
