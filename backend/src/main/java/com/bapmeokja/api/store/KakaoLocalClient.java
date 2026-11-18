package com.bapmeokja.api.store;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * 카카오 로컬 API의 키워드 검색으로 내 위치 주변 음식점을 찾는다.
 * 키가 없거나 호출이 실패하면 빈 목록을 돌려주고, 화면은 DB에 등록된 매장만 보여 준다.
 */
@Slf4j
@Component
public class KakaoLocalClient {

    // 카카오 카테고리 그룹 코드: FD6 = 음식점
    private static final String RESTAURANT_GROUP = "FD6";
    private static final int MAX_RADIUS_METERS = 20_000;
    private static final int PAGE_SIZE = 15;

    private final KakaoLocalProperties properties;
    private final RestClient restClient;

    @Autowired
    public KakaoLocalClient(RestClient.Builder restClientBuilder, KakaoLocalProperties properties) {
        this(restClientBuilder.requestFactory(ClientHttpRequestFactoryBuilder.detect().build(
                ClientHttpRequestFactorySettings.defaults()
                        .withConnectTimeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                        .withReadTimeout(Duration.ofSeconds(properties.getTimeoutSeconds())))), properties, true);
    }

    /** 테스트에서 가짜 서버에 묶인 builder를 그대로 쓸 때 사용한다. */
    KakaoLocalClient(RestClient.Builder restClientBuilder, KakaoLocalProperties properties, boolean ignored) {
        this.properties = properties;
        this.restClient = restClientBuilder.baseUrl(properties.getBaseUrl()).build();
    }

    public boolean isEnabled() {
        return properties.isEnabled();
    }

    public List<KakaoPlace> searchRestaurants(String keyword, double lat, double lng, int radius) {
        if (!isEnabled() || keyword == null || keyword.isBlank()) {
            return List.of();
        }
        try {
            JsonNode response = restClient.get()
                    .uri(uri -> uri.path("/v2/local/search/keyword.json")
                            .queryParam("query", keyword)
                            .queryParam("category_group_code", RESTAURANT_GROUP)
                            .queryParam("x", lng)
                            .queryParam("y", lat)
                            .queryParam("radius", Math.min(Math.max(radius, 1), MAX_RADIUS_METERS))
                            .queryParam("sort", "distance")
                            .queryParam("size", PAGE_SIZE)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "KakaoAK " + properties.getRestApiKey())
                    .retrieve()
                    .body(JsonNode.class);
            return toPlaces(response);
        } catch (RestClientException exception) {
            // 키·할당량·네트워크 문제여도 주변 식당 화면은 등록 매장으로 계속 동작해야 한다.
            log.warn("Kakao local search failed: {}", exception.getClass().getSimpleName());
            return List.of();
        }
    }

    private List<KakaoPlace> toPlaces(JsonNode response) {
        List<KakaoPlace> places = new ArrayList<>();
        if (response == null || !response.path("documents").isArray()) {
            return places;
        }
        for (JsonNode document : response.path("documents")) {
            String id = document.path("id").asText("");
            String name = document.path("place_name").asText("");
            if (id.isBlank() || name.isBlank() || !document.hasNonNull("x") || !document.hasNonNull("y")) {
                continue;
            }
            String roadAddress = document.path("road_address_name").asText("");
            places.add(new KakaoPlace(
                    id,
                    name,
                    roadAddress.isBlank() ? document.path("address_name").asText("") : roadAddress,
                    document.path("y").asDouble(),
                    document.path("x").asDouble(),
                    document.path("distance").asInt(0),
                    document.path("place_url").asText(null)
            ));
        }
        return places;
    }

    public record KakaoPlace(
            String id,
            String name,
            String address,
            double lat,
            double lng,
            int distance,
            String placeUrl
    ) {
    }
}
