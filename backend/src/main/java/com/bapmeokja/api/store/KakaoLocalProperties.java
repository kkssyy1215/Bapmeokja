package com.bapmeokja.api.store;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.kakao")
public class KakaoLocalProperties {

    /** 비어 있으면 카카오를 부르지 않고 DB에 등록된 매장만 보여 준다. */
    private String restApiKey = "";
    private String baseUrl = "https://dapi.kakao.com";
    private int timeoutSeconds = 3;

    public boolean isEnabled() {
        return restApiKey != null && !restApiKey.isBlank();
    }
}
