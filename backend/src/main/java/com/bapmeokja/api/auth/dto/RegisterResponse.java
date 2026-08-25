package com.bapmeokja.api.auth.dto;

public record RegisterResponse(String userId, String nickname, boolean isNewUser) {
}
