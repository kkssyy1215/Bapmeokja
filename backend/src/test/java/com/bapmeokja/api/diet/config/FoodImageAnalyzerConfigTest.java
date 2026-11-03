package com.bapmeokja.api.diet.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.bapmeokja.api.diet.service.GeminiFoodImageAnalyzer;
import com.bapmeokja.api.diet.service.HeuristicFoodImageAnalyzer;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

class FoodImageAnalyzerConfigTest {
    private final FoodImageAnalyzerConfig config = new FoodImageAnalyzerConfig();

    @Test
    void usesTheDemoAnalyzerWithoutAnApiKey() {
        assertThat(config.foodImageAnalyzer(properties(""), RestClient.builder(), new ObjectMapper()))
                .isInstanceOf(HeuristicFoodImageAnalyzer.class);
    }

    @Test
    void usesGeminiWhenAnApiKeyIsConfigured() {
        assertThat(config.foodImageAnalyzer(properties("key"), RestClient.builder(), new ObjectMapper()))
                .isInstanceOf(GeminiFoodImageAnalyzer.class);
    }

    private AiAnalyzerProperties properties(String apiKey) {
        AiAnalyzerProperties properties = new AiAnalyzerProperties();
        properties.setApiKey(apiKey);
        return properties;
    }
}
