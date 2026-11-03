package com.bapmeokja.api.diet.config;

import com.bapmeokja.api.diet.service.FoodImageAnalyzer;
import com.bapmeokja.api.diet.service.GeminiFoodImageAnalyzer;
import com.bapmeokja.api.diet.service.HeuristicFoodImageAnalyzer;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Slf4j
@Configuration
public class FoodImageAnalyzerConfig {

    @Bean
    public FoodImageAnalyzer foodImageAnalyzer(
            AiAnalyzerProperties properties,
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper
    ) {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            log.warn("GEMINI_API_KEY is not set: food photos use the filename-based demo analyzer");
            return new HeuristicFoodImageAnalyzer();
        }
        log.info("Food photos are analyzed with Gemini model {}", properties.getModel());
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(Duration.ofSeconds(5))
                .withReadTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()));
        return new GeminiFoodImageAnalyzer(
                restClientBuilder.requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings)),
                properties,
                objectMapper
        );
    }
}
