package com.bapmeokja.api.store.place;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.places")
public class PlaceSearchProperties {

    /** 카카오 로컬 REST API 키. 비어 있으면 외부 검색 없이 등록 매장만 보여 준다. */
    private String kakaoRestApiKey = "";
    private String kakaoBaseUrl = "https://dapi.kakao.com";
    private int timeoutSeconds = 4;
}
