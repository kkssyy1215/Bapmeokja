package com.bapmeokja.api.diet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record NutritionItemRequest(
        @Size(max = 50) String itemId,
        @NotBlank @Size(max = 100) String name,
        @NotNull @DecimalMin("0.1") @Digits(integer = 7, fraction = 2) BigDecimal weightGram,
        @NotNull @PositiveOrZero @Digits(integer = 7, fraction = 2) BigDecimal calorie,
        @NotNull @PositiveOrZero @Digits(integer = 7, fraction = 2) BigDecimal carb,
        @NotNull @PositiveOrZero @Digits(integer = 7, fraction = 2) BigDecimal protein,
        @NotNull @PositiveOrZero @Digits(integer = 7, fraction = 2) BigDecimal fat
) {
}
