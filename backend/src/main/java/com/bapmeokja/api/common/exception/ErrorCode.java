package com.bapmeokja.api.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INVALID_CREDENTIALS("AUTH_001", HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 확인해주세요."),
    DUPLICATED_USER_VALUE("AUTH_002", HttpStatus.CONFLICT, "이미 사용 중인 정보입니다."),
    UNAUTHORIZED("AUTH_003", HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다. 다시 로그인해주세요."),
    EXPIRED_TOKEN("AUTH_004", HttpStatus.UNAUTHORIZED, "로그인이 만료되었습니다. 다시 로그인해주세요."),
    FORBIDDEN("AUTH_020", HttpStatus.FORBIDDEN, "해당 요청을 처리할 권한이 없습니다."),
    LOCATION_CONSENT_REQUIRED("AUTH_020", HttpStatus.FORBIDDEN, "위치 정보 이용 동의가 필요합니다."),
    CURRENT_PASSWORD_MISMATCH("AUTH_010", HttpStatus.UNAUTHORIZED, "현재 비밀번호가 올바르지 않습니다."),

    USERNAME_REQUIRED("VALID_001", HttpStatus.BAD_REQUEST, "아이디를 입력해주세요."),
    PASSWORD_REQUIRED("VALID_002", HttpStatus.BAD_REQUEST, "비밀번호를 입력해주세요."),
    INVALID_PASSWORD_FORMAT("VALID_003", HttpStatus.BAD_REQUEST,
            "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다."),
    PASSWORD_CONFIRM_MISMATCH("VALID_004", HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다."),
    TERMS_REQUIRED("VALID_005", HttpStatus.BAD_REQUEST, "이용약관 및 개인정보처리방침에 동의해주세요."),
    REQUIRED_VALUE_MISSING("VALID_010", HttpStatus.BAD_REQUEST, "필수 정보를 모두 입력해주세요."),
    INVALID_PARAMETER("VALID_011", HttpStatus.BAD_REQUEST, "입력값의 범위 또는 형식을 확인해주세요."),
    METHOD_NOT_ALLOWED("VALID_012", HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 요청 방식입니다."),
    UNSUPPORTED_MEDIA_TYPE("VALID_013", HttpStatus.UNSUPPORTED_MEDIA_TYPE, "지원하지 않는 요청 형식입니다."),
    IMAGE_REQUIRED("VALID_020", HttpStatus.BAD_REQUEST, "이미지를 첨부해주세요."),

    AI_ANALYSIS_FAILED("AI_001", HttpStatus.BAD_GATEWAY, "음식 인식에 실패했습니다. 다시 시도해주세요."),
    AI_TIMEOUT("AI_002", HttpStatus.GATEWAY_TIMEOUT, "음식 분석 시간이 초과되었습니다. 다시 시도해주세요."),
    EXTERNAL_SERVICE_UNAVAILABLE("NET_001", HttpStatus.SERVICE_UNAVAILABLE,
            "외부 서비스 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요."),
    TOO_MANY_REQUESTS("RATE_001", HttpStatus.TOO_MANY_REQUESTS, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."),

    RESOURCE_NOT_FOUND("NOTFOUND_001", HttpStatus.NOT_FOUND, "요청한 정보를 찾을 수 없습니다."),
    USER_NOT_FOUND("NOTFOUND_001", HttpStatus.NOT_FOUND, "사용자 정보를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR("SERVER_001", HttpStatus.INTERNAL_SERVER_ERROR,
            "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");

    private final String code;
    private final HttpStatus status;
    private final String message;

    ErrorCode(String code, HttpStatus status, String message) {
        this.code = code;
        this.status = status;
        this.message = message;
    }
}
