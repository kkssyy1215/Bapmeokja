package com.bapmeokja.api.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.bapmeokja.api.store.KakaoLocalClient.KakaoPlace;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class KakaoLocalClientTest {
    private KakaoLocalProperties properties;
    private RestClient.Builder builder;
    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        properties = new KakaoLocalProperties();
        properties.setRestApiKey("test-key");
        properties.setBaseUrl("https://kakao.test");
        builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
    }

    @Test
    void searchesRestaurantsAroundTheLocationAndMapsPlaces() {
        server.expect(requestTo(org.hamcrest.Matchers.startsWith("https://kakao.test/v2/local/search/keyword.json")))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("Authorization", "KakaoAK test-key"))
                .andExpect(queryParam("category_group_code", "FD6"))
                .andExpect(queryParam("x", "127.0276"))
                .andExpect(queryParam("y", "37.4979"))
                .andExpect(queryParam("radius", "1500"))
                .andExpect(queryParam("sort", "distance"))
                .andRespond(withSuccess("""
                        {"documents":[
                          {"id":"123","place_name":"포케올데이 강남점","road_address_name":"서울 강남구 강남대로 1",
                           "address_name":"서울 강남구 역삼동 1","x":"127.0280","y":"37.4985","distance":"85",
                           "place_url":"http://place.map.kakao.com/123"},
                          {"id":"456","place_name":"지번만 있는 집","road_address_name":"","address_name":"서울 강남구 역삼동 2",
                           "x":"127.0290","y":"37.4990","distance":"210","place_url":"http://place.map.kakao.com/456"},
                          {"id":"","place_name":"아이디 없는 집","x":"127.0","y":"37.0"}
                        ]}""", MediaType.APPLICATION_JSON));

        List<KakaoPlace> places = client().searchRestaurants("포케", 37.4979, 127.0276, 1500);

        assertThat(places).containsExactly(
                new KakaoPlace("123", "포케올데이 강남점", "서울 강남구 강남대로 1", 37.4985, 127.0280, 85,
                        "http://place.map.kakao.com/123"),
                new KakaoPlace("456", "지번만 있는 집", "서울 강남구 역삼동 2", 37.4990, 127.0290, 210,
                        "http://place.map.kakao.com/456"));
        server.verify();
    }

    @Test
    void returnsNothingWhenKakaoFails() {
        server.expect(requestTo(org.hamcrest.Matchers.startsWith("https://kakao.test/")))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThat(client().searchRestaurants("포케", 37.4979, 127.0276, 1500)).isEmpty();
    }

    @Test
    void doesNotCallKakaoWithoutAKey() {
        properties.setRestApiKey("");

        assertThat(client().searchRestaurants("포케", 37.4979, 127.0276, 1500)).isEmpty();
        server.verify();
    }

    private KakaoLocalClient client() {
        return new KakaoLocalClient(builder, properties, true);
    }
}
