package com.bapmeokja.api.common.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bapmeokja.api.common.response.ApiResponse;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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

    // 회귀 테스트(BUG-001): 형식이 잘못된 날짜·숫자 쿼리 파라미터가 500이 아닌 400을 반환해야 한다.
    @Test
    void malformedTypedQueryParameterReturnsBadRequest() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new TypedQueryController())
                .setControllerAdvice(handler)
                .build();

        mockMvc.perform(get("/typed").param("date", "2026-13-40").param("year", "2026"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALID_011"));
        mockMvc.perform(get("/typed").param("date", "2026-10-14").param("year", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALID_011"));
        mockMvc.perform(get("/typed").param("date", "2026-10-14").param("year", "2026"))
                .andExpect(status().isOk());
    }

    // 회귀 테스트(BUG-006): 없는 주소·잘못된 메서드·잘못된 형식이 500이 아닌 4xx를 반환해야 한다.
    @Test
    void requestRoutingErrorsAreNotServerErrors() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new TypedQueryController())
                .setControllerAdvice(handler)
                .build();

        mockMvc.perform(delete("/typed"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.errorCode").value("VALID_012"));
        mockMvc.perform(post("/upload").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.errorCode").value("VALID_013"));
        assertThat(handler.handleNoResource(new NoResourceFoundException(HttpMethod.GET, "/none")).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    // 회귀 테스트(BUG-008): 표현할 수 없는 날짜 계산(9999-12-31 + 7일)도 입력 오류로 응답해야 한다.
    @Test
    void dateCalculationOverflowIsABadRequest() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new TypedQueryController())
                .setControllerAdvice(handler)
                .build();

        mockMvc.perform(get("/overflow").param("date", "9999-12-31"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALID_011"));
    }

    @RestController
    static class TypedQueryController {
        @GetMapping("/typed")
        String typed(
                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                @RequestParam int year
        ) {
            return date + "/" + year;
        }

        @GetMapping("/overflow")
        String overflow(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            return date.plusYears(1_000_000_000).toString();
        }

        @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        String upload() {
            return "ok";
        }
    }
}
