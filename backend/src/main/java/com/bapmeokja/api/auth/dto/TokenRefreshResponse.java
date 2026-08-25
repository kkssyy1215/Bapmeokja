package com.bapmeokja.api.auth.dto;

public record TokenRefreshResponse(String accessToken, String refreshToken) {
}
