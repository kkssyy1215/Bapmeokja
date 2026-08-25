package com.bapmeokja.api.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record BudgetUpdateRequest(
        @Min(0) @Max(10_000_000) Integer diningOut,
        @Min(0) @Max(10_000_000) Integer homeCooking
) {
}
