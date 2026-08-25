package com.bapmeokja.api.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        @JsonInclude(JsonInclude.Include.ALWAYS)
        T data,
        String message,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        String errorCode,
        Instant timestamp
) {

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message, null, Instant.now());
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "요청이 처리되었습니다.");
    }

    public static ApiResponse<Void> successMessage(String message) {
        return success(null, message);
    }

    public static ApiResponse<Void> failure(String errorCode, String message) {
        return new ApiResponse<>(false, null, message, errorCode, Instant.now());
    }
}
