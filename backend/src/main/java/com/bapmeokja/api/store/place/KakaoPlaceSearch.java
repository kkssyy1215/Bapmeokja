package com.bapmeokja.api.store.place;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** 카카오 로컬 키워드 검색. 음식점(FD6) 중 현재 위치에서 가까운 순서로 받는다. */
@Slf4j
public class KakaoPlaceSearch implements PlaceSearch {

    private final RestClient restClient;

    public KakaoPlaceSearch(RestClient.Builder builder, PlaceSearchProperties properties) {
        this.restClient = builder
                .baseUrl(properties.getKakaoBaseUrl())
                .defaultHeader("Authorization", "KakaoAK " + properties.getKakaoRestApiKey())
                .build();
    }

    @Override
    public String source() {
        return "kakao";
    }

    @Override
    public List<Place> search(double lat, double lng, int radius, String keyword) {
        try {
            JsonNode body = restClient.get()
                    .uri(uri -> uri.path("/v2/local/search/keyword.json")
                            .queryParam("query", keyword)
                            .queryParam("x", lng)
                            .queryParam("y", lat)
                            .queryParam("radius", Math.min(radius, 20_000))
                            .queryParam("sort", "distance")
                            .queryParam("category_group_code", "FD6")
                            .queryParam("size", 15)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
            List<Place> places = new ArrayList<>();
            if (body == null) {
                return places;
            }
            for (JsonNode doc : body.path("documents")) {
                String road = doc.path("road_address_name").asText("");
                String[] categories = doc.path("category_name").asText("").split(">");
                places.add(new Place(
                        "kakao_" + doc.path("id").asText(),
                        doc.path("place_name").asText(),
                        road.isBlank() ? doc.path("address_name").asText("") : road,
                        doc.path("y").asDouble(),
                        doc.path("x").asDouble(),
                        // "음식점 > 한식 > 국수 > 명동할머니국수"처럼 마지막에 상호가 오기도 해서 두 번째 단계(한식, 분식 등)를 쓴다.
                        (categories.length > 1 ? categories[1] : categories[0]).trim(),
                        doc.path("place_url").asText(null)
                ));
            }
            return places;
        } catch (RestClientException exception) {
            log.warn("Kakao place search failed: {}", exception.getClass().getSimpleName());
            return List.of();
        }
    }
}
