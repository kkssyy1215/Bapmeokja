package com.bapmeokja.api.diet.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.diet.config.AiAnalyzerProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class GeminiFoodImageAnalyzerTest {
    private static final byte[] BYTES = {1, 2, 3, 4};
    private static final MockMultipartFile IMAGE = new MockMultipartFile("image", "IMG_1234.jpg", "image/jpeg", BYTES);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private MockRestServiceServer server;
    private GeminiFoodImageAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        AiAnalyzerProperties properties = new AiAnalyzerProperties();
        properties.setApiKey("test-key");
        properties.setModel("test-model");
        properties.setBaseUrl("https://gemini.test/v1beta");
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        analyzer = new GeminiFoodImageAnalyzer(builder, properties, objectMapper);
    }

    @Test
    void sendsThePhotoToTheModelAndMapsDetectedFoods() {
        server.expect(requestTo("https://gemini.test/v1beta/models/test-model:generateContent"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-goog-api-key", "test-key"))
                .andExpect(jsonPath("$.contents[0].parts[1].inlineData.mimeType").value("image/jpeg"))
                .andExpect(jsonPath("$.contents[0].parts[1].inlineData.data")
                        .value(Base64.getEncoder().encodeToString(BYTES)))
                .andExpect(jsonPath("$.generationConfig.responseMimeType").value("application/json"))
                .andRespond(modelReply("""
                        {"foodName":"쌀국수","items":[{"name":"쌀국수","weightGram":244,"calorie":352,
                        "carb":31.6,"protein":34.7,"fat":7.7,"sodium":900,"cholesterol":60}]}"""));

        FoodImageAnalyzer.ImageAnalysisResult result = analyzer.analyze(IMAGE);

        assertThat(result.foodName()).isEqualTo("쌀국수");
        assertThat(result.items()).hasSize(1);
        FoodImageAnalyzer.DetectedFood food = result.items().get(0);
        assertThat(food.foodId()).isNull();
        assertThat(food.calorie()).isEqualByComparingTo("352");
        assertThat(food.protein()).isEqualByComparingTo("34.7");
        server.verify();
    }

    @Test
    void returnsNoItemsWhenThePhotoHasNoFood() {
        server.expect(requestTo("https://gemini.test/v1beta/models/test-model:generateContent"))
                .andRespond(modelReply("{\"foodName\":\"\",\"items\":[]}"));

        assertThat(analyzer.analyze(IMAGE).items()).isEmpty();
    }

    @Test
    void dropsUnusableItemsAndClampsOutOfRangeValues() {
        server.expect(requestTo("https://gemini.test/v1beta/models/test-model:generateContent"))
                .andRespond(modelReply("""
                        {"foodName":"","items":[
                        {"name":"","weightGram":100,"calorie":100,"carb":1,"protein":1,"fat":1,"sodium":1,"cholesterol":1},
                        {"name":"무게없음","weightGram":0,"calorie":100,"carb":1,"protein":1,"fat":1,"sodium":1,"cholesterol":1},
                        {"name":"밥","weightGram":200,"calorie":-50,"carb":99999,"protein":10,"fat":2,"sodium":3,"cholesterol":0}
                        ]}"""));

        FoodImageAnalyzer.ImageAnalysisResult result = analyzer.analyze(IMAGE);

        assertThat(result.foodName()).isEqualTo("밥");
        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).calorie()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.items().get(0).carb()).isEqualByComparingTo("5000");
    }

    @Test
    void quotaExhaustionAndServerErrorsAreReportedAsServiceUnavailable() {
        server.expect(requestTo("https://gemini.test/v1beta/models/test-model:generateContent"))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS));

        assertFailsWith(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE);
    }

    @Test
    void invalidKeyOrRequestIsReportedAsAnalysisFailure() {
        server.expect(requestTo("https://gemini.test/v1beta/models/test-model:generateContent"))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST));

        assertFailsWith(ErrorCode.AI_ANALYSIS_FAILED);
    }

    @Test
    void blockedResponseWithoutTextIsAnalysisFailure() {
        server.expect(requestTo("https://gemini.test/v1beta/models/test-model:generateContent"))
                .andRespond(withSuccess("{\"promptFeedback\":{\"blockReason\":\"SAFETY\"}}", MediaType.APPLICATION_JSON));

        assertFailsWith(ErrorCode.AI_ANALYSIS_FAILED);
    }

    @Test
    void nonJsonModelTextIsAnalysisFailure() {
        server.expect(requestTo("https://gemini.test/v1beta/models/test-model:generateContent"))
                .andRespond(modelReply("죄송합니다"));

        assertFailsWith(ErrorCode.AI_ANALYSIS_FAILED);
    }

    private void assertFailsWith(ErrorCode code) {
        assertThatThrownBy(() -> analyzer.analyze(IMAGE))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(code));
    }

    private org.springframework.test.web.client.ResponseCreator modelReply(String text) {
        try {
            String body = objectMapper.writeValueAsString(java.util.Map.of("candidates", java.util.List.of(
                    java.util.Map.of("content", java.util.Map.of("parts", java.util.List.of(
                            java.util.Map.of("text", text)
                    )))
            )));
            return withSuccess(body, MediaType.APPLICATION_JSON);
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
