package com.bapmeokja.api.store.place;

import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Slf4j
@Configuration
public class PlaceSearchConfig {

    @Bean
    public PlaceSearch placeSearch(PlaceSearchProperties properties, RestClient.Builder restClientBuilder) {
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(Duration.ofSeconds(3))
                .withReadTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()));
        RestClient.Builder builder = restClientBuilder.clone()
                .requestFactory(ClientHttpRequestFactoryBuilder.detect().build(settings));
        if (properties.getKakaoRestApiKey() == null || properties.getKakaoRestApiKey().isBlank()) {
            log.warn("KAKAO_REST_API_KEY is not set: nearby search shows registered stores only");
            return new NoPlaceSearch();
        }
        log.info("Nearby restaurants come from Kakao local search");
        return new KakaoPlaceSearch(builder, properties);
    }
}
