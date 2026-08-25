package com.bapmeokja.api.auth.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        boolean isNewUser,
        String userId,
        String nickname
) {
}
