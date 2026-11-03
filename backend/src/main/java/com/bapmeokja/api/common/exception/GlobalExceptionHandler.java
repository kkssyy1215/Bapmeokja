package com.bapmeokja.api.common.exception;

import com.bapmeokja.api.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.time.DateTimeException;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException exception) {
        ErrorCode code = exception.getErrorCode();
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.failure(code.getCode(), exception.getMessage()));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class})
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> Objects.requireNonNullElse(error.getDefaultMessage(), ErrorCode.INVALID_PARAMETER.getMessage()))
                .orElse(ErrorCode.INVALID_PARAMETER.getMessage());
        ErrorCode code = validationCode(message);
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.failure(code.getCode(), message));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingRequestPart(MissingServletRequestPartException exception) {
        ErrorCode code = ErrorCode.IMAGE_REQUIRED;
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.failure(code.getCode(), code.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException exception) {
        ErrorCode code = ErrorCode.INVALID_PARAMETER;
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.failure(code.getCode(), "이미지는 최대 10MB까지 업로드할 수 있습니다."));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingRequestParameter(
            MissingServletRequestParameterException exception
    ) {
        if ("value".equals(exception.getParameterName())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure(ErrorCode.USERNAME_REQUIRED.getCode(), "확인할 값을 입력해주세요."));
        }
        ErrorCode code = ErrorCode.REQUIRED_VALUE_MISSING;
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.failure(code.getCode(), code.getMessage()));
    }

    // 쿼리 파라미터 타입 변환 실패(예: date=2026-13-40, year=abc)는 클라이언트 입력 오류이므로 400으로 응답한다.
    @ExceptionHandler({ConstraintViolationException.class, MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class, IllegalArgumentException.class, DateTimeException.class})
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(Exception exception) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.failure(ErrorCode.INVALID_PARAMETER.getCode(), ErrorCode.INVALID_PARAMETER.getMessage()));
    }

    // 없는 주소·잘못된 메서드·잘못된 형식은 서버 장애가 아니라 요청 오류이므로 해당 상태 코드로 응답한다.
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResource(NoResourceFoundException exception) {
        return failure(ErrorCode.RESOURCE_NOT_FOUND);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        return failure(ErrorCode.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException exception) {
        return failure(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedException(Exception exception) {
        log.error("Unhandled server exception", exception);
        ErrorCode code = ErrorCode.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.failure(code.getCode(), code.getMessage()));
    }

    private ResponseEntity<ApiResponse<Void>> failure(ErrorCode code) {
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.failure(code.getCode(), code.getMessage()));
    }

    private ErrorCode validationCode(String message) {
        if (message.equals("아이디를 입력해주세요.")) {
            return ErrorCode.USERNAME_REQUIRED;
        }
        if (message.equals("비밀번호를 입력해주세요.")) {
            return ErrorCode.PASSWORD_REQUIRED;
        }
        if (message.startsWith("비밀번호는 영문")) {
            return ErrorCode.INVALID_PASSWORD_FORMAT;
        }
        if (message.contains("이용약관") || message.contains("개인정보처리방침")) {
            return ErrorCode.TERMS_REQUIRED;
        }
        if (message.contains("선택해주세요") || message.contains("입력해주세요")) {
            return ErrorCode.REQUIRED_VALUE_MISSING;
        }
        return ErrorCode.INVALID_PARAMETER;
    }
}
