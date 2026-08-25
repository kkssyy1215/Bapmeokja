package com.bapmeokja.api.diet.dto;

import com.bapmeokja.api.diet.domain.MealType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public record UpdateDietRecordRequest(
        @NotNull MealType mealType,
        @NotNull Instant eatenAt,
        @NotEmpty @Size(max = 30) List<@Valid NutritionItemRequest> items
) {
}
