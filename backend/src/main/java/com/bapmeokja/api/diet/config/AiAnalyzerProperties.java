package com.bapmeokja.api.diet.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiAnalyzerProperties {

    private String apiKey = "";
    private String model = "gemini-3.5-flash-lite";
    private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    private int timeoutSeconds = 30;
}
