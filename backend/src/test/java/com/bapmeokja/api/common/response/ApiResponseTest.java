package com.bapmeokja.api.common.response;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class ApiResponseTest {
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void emptySuccessIncludesNullDataAndOmitsErrorCode() {
        JsonNode json = objectMapper.valueToTree(ApiResponse.successMessage("완료"));

        assertThat(json.path("success").asBoolean()).isTrue();
        assertThat(json.has("data")).isTrue();
        assertThat(json.get("data").isNull()).isTrue();
        assertThat(json.has("errorCode")).isFalse();
    }

    @Test
    void failureIncludesNullDataAndErrorCode() {
        JsonNode json = objectMapper.valueToTree(ApiResponse.failure("VALID_011", "입력값을 확인해주세요."));

        assertThat(json.path("success").asBoolean()).isFalse();
        assertThat(json.has("data")).isTrue();
        assertThat(json.get("data").isNull()).isTrue();
        assertThat(json.path("errorCode").asText()).isEqualTo("VALID_011");
    }
}
