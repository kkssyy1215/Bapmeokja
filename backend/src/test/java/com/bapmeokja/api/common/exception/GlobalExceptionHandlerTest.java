package com.bapmeokja.api.common.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.bapmeokja.api.common.response.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

class GlobalExceptionHandlerTest {
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void missingMultipartImageUsesImageRequiredError() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleMissingRequestPart(
                new MissingServletRequestPartException("image")
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().errorCode()).isEqualTo("VALID_020");
        assertThat(response.getBody().message()).isEqualTo("이미지를 첨부해주세요.");
    }

    @Test
    void oversizedMultipartImageExplainsTenMegabyteLimit() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleMaxUploadSizeExceeded(
                new MaxUploadSizeExceededException(10L * 1024 * 1024)
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().errorCode()).isEqualTo("VALID_011");
        assertThat(response.getBody().message()).contains("10MB");
    }

    @Test
    void missingDuplicateCheckValueUsesSpecifiedValidationCode() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleMissingRequestParameter(
                new MissingServletRequestParameterException("value", "String")
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().errorCode()).isEqualTo("VALID_001");
        assertThat(response.getBody().message()).isEqualTo("확인할 값을 입력해주세요.");
    }

    @Test
    void otherMissingRequiredQueryUsesRequiredValueError() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleMissingRequestParameter(
                new MissingServletRequestParameterException("date", "LocalDate")
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().errorCode()).isEqualTo("VALID_010");
    }
}
