package com.bapmeokja.api.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record TokenRefreshRequest(
        @NotBlank(message = "refreshToken을 입력해주세요.") String refreshToken
) {
}
