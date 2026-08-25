package com.bapmeokja.api.user.dto;

import com.bapmeokja.api.user.domain.ActivityLevel;
import com.bapmeokja.api.user.domain.Gender;
import com.bapmeokja.api.user.domain.Goal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InitialProfileRequest(
        @NotNull(message = "성별을 선택해주세요.") Gender gender,
        @NotNull(message = "나이를 입력해주세요.") @Min(1) @Max(120) Integer age,
        @NotNull(message = "신장을 입력해주세요.") @DecimalMin("100.0") @DecimalMax("250.0") Double height,
        @NotNull(message = "몸무게를 입력해주세요.") @DecimalMin("20.0") @DecimalMax("300.0") Double weight,
        @NotNull(message = "활동량을 선택해주세요.") ActivityLevel activityLevel,
        @NotNull(message = "목표를 선택해주세요.") Goal goal,
        @DecimalMin("5.0") @DecimalMax("100.0") Double skeletalMuscleMass,
        @DecimalMin("1.0") @DecimalMax("200.0") Double bodyFatMass,
        @DecimalMin("1.0") @DecimalMax("70.0") Double bodyFatPercentage
) {
}
