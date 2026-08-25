package com.bapmeokja.api.fridge;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public final class FridgeDtos {
    private FridgeDtos() {
    }

    public record CreateRequest(
            @NotEmpty(message = "등록할 재료를 1개 이상 추가해주세요.")
            @Size(max = 50, message = "재료는 한 번에 최대 50개까지 등록할 수 있습니다.")
            List<@Valid IngredientInput> ingredients
    ) {
    }

    public record IngredientInput(
            @NotBlank(message = "재료명을 입력해주세요.") @Size(max = 100) String name,
            @Positive(message = "수량은 0보다 커야 합니다.") double quantity,
            @NotBlank(message = "단위를 입력해주세요.") @Size(max = 20) String unit,
            LocalDate expiryDate
    ) {
    }

    public record UpdateRequest(
            @Positive(message = "수량은 0보다 커야 합니다.") double quantity,
            @NotBlank(message = "단위를 입력해주세요.") @Size(max = 20) String unit,
            LocalDate expiryDate
    ) {
    }

    public record CreateResponse(int registeredCount) {
    }

    public record ListResponse(List<IngredientResponse> ingredients) {
    }

    public record IngredientResponse(
            String ingredientId,
            String name,
            double quantity,
            String unit,
            LocalDate expiryDate,
            boolean isExpiringSoon
    ) {
    }
}
