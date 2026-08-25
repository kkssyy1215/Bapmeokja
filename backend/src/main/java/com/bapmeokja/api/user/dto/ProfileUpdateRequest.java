package com.bapmeokja.api.user.dto;

import com.bapmeokja.api.user.domain.ActivityLevel;
import com.bapmeokja.api.user.domain.Gender;
import com.bapmeokja.api.user.domain.Goal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(min = 2, max = 20, message = "닉네임은 2~20자로 입력해주세요.") String nickname,
        Gender gender,
        @Min(1) @Max(120) Integer age,
        @DecimalMin("100.0") @DecimalMax("250.0") Double height,
        @DecimalMin("20.0") @DecimalMax("300.0") Double weight,
        ActivityLevel activityLevel,
        Goal goal,
        @DecimalMin("5.0") @DecimalMax("100.0") Double skeletalMuscleMass,
        @DecimalMin("1.0") @DecimalMax("200.0") Double bodyFatMass,
        @DecimalMin("1.0") @DecimalMax("70.0") Double bodyFatPercentage
) {
}
