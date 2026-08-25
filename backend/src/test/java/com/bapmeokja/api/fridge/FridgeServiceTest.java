package com.bapmeokja.api.fridge;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FridgeServiceTest {
    private FridgeIngredientRepository repository;
    private CurrentUserProvider currentUserProvider;
    private FridgeService service;
    private User user;

    @BeforeEach
    void setUp() {
        repository = mock(FridgeIngredientRepository.class);
        currentUserProvider = mock(CurrentUserProvider.class);
        user = mock(User.class);
        when(user.getId()).thenReturn(1L);
        when(currentUserProvider.get()).thenReturn(user);
        service = new FridgeService(repository, currentUserProvider);
    }

    @Test
    void marksIngredientExpiringWithinThreeDays() {
        FridgeIngredient ingredient = new FridgeIngredient(
                "ing_1",
                user,
                "두부",
                1,
                "모",
                LocalDate.now(ZoneOffset.UTC).plusDays(2)
        );
        when(repository.findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(1L))
                .thenReturn(List.of(ingredient));

        FridgeDtos.ListResponse result = service.getAll();

        assertThat(result.ingredients()).hasSize(1);
        assertThat(result.ingredients().get(0).isExpiringSoon()).isTrue();
    }
}
