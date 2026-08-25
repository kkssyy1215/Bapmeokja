package com.bapmeokja.api.recipe;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.fridge.FridgeIngredientRepository;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.user.domain.User;
import java.util.List;
import org.junit.jupiter.api.Test;

class RecipeServiceTest {

    @Test
    void leftoverRecommendationRequiresFridgeIngredients() {
        FridgeIngredientRepository fridgeRepository = mock(FridgeIngredientRepository.class);
        CurrentUserProvider currentUserProvider = mock(CurrentUserProvider.class);
        User user = mock(User.class);
        when(user.getId()).thenReturn(7L);
        when(currentUserProvider.get()).thenReturn(user);
        when(fridgeRepository.findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(7L))
                .thenReturn(List.of());
        RecipeService service = new RecipeService(
                mock(RecipeCategoryRepository.class),
                mock(RecipeRepository.class),
                mock(RecipeIngredientRepository.class),
                mock(RecipeIngredientAlternativeRepository.class),
                mock(RecipeStepRepository.class),
                fridgeRepository,
                currentUserProvider
        );

        assertThatThrownBy(service::recommendLeftover)
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("냉장고 재료");
    }
}
