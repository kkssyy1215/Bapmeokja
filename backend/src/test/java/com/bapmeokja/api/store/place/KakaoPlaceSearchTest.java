package com.bapmeokja.api.store.place;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class KakaoPlaceSearchTest {

    private MockRestServiceServer server;
    private KakaoPlaceSearch search;

    @BeforeEach
    void setUp() {
        PlaceSearchProperties properties = new PlaceSearchProperties();
        properties.setKakaoRestApiKey("test-key");
        properties.setKakaoBaseUrl("https://kakao.test");
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).ignoreExpectOrder(true).build();
        search = new KakaoPlaceSearch(builder, properties);
    }

    @Test
    void searchesRestaurantsNearTheUserAndMapsThePlaces() {
        server.expect(requestTo(org.hamcrest.Matchers.startsWith("https://kakao.test/v2/local/search/keyword.json")))
                .andExpect(header("Authorization", "KakaoAK test-key"))
                .andExpect(queryParam("query", URLEncoder.encode("제육덮밥", StandardCharsets.UTF_8)))
                .andExpect(queryParam("category_group_code", "FD6"))
                .andExpect(queryParam("sort", "distance"))
                .andRespond(withSuccess("""
                        {"documents":[{"id":"123","place_name":"제육한상","category_name":"음식점 > 한식 > 백반",
                        "road_address_name":"서울 중구 세종대로 1","address_name":"서울 중구 태평로1가 1",
                        "x":"126.9781","y":"37.5667","place_url":"http://place.map.kakao.com/123"}]}""",
                        MediaType.APPLICATION_JSON));

        List<PlaceSearch.Place> places = search.search(37.5665, 126.978, 1500, "제육덮밥");

        assertThat(places).singleElement().satisfies(place -> {
            assertThat(place.id()).isEqualTo("kakao_123");
            assertThat(place.name()).isEqualTo("제육한상");
            assertThat(place.category()).isEqualTo("한식");
            assertThat(place.address()).isEqualTo("서울 중구 세종대로 1");
            assertThat(place.lat()).isEqualTo(37.5667);
            assertThat(place.placeUrl()).isEqualTo("http://place.map.kakao.com/123");
        });
        server.verify();
    }

    @Test
    void failuresAreReturnedAsAnEmptyList() {
        server.expect(requestTo(org.hamcrest.Matchers.startsWith("https://kakao.test/")))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThat(search.search(37.5665, 126.978, 1500, "김밥")).isEmpty();
    }
}
