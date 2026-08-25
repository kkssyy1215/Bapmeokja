package com.bapmeokja.api.security;

import java.time.Instant;

public record TokenPair(
        String accessToken,
        String refreshToken,
        Instant refreshTokenExpiresAt
) {
}
