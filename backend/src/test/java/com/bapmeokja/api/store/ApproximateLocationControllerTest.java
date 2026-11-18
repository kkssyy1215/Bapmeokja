package com.bapmeokja.api.store;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ApproximateLocationControllerTest {

    private final ApproximateLocationController controller = new ApproximateLocationController();

    @Test
    void readsTheNetworkLocationHeadersFromVercel() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("x-vercel-ip-latitude", "37.5665");
        request.addHeader("x-vercel-ip-longitude", "126.978");
        request.addHeader("x-vercel-ip-city", "Seoul");

        ApproximateLocationController.ApproximateLocation location = controller.approximate(request).data();

        assertThat(location.lat()).isEqualTo(37.5665);
        assertThat(location.lng()).isEqualTo(126.978);
        assertThat(location.city()).isEqualTo("Seoul");
    }

    @Test
    void withoutHeadersThereIsNoLocation() {
        assertThat(controller.approximate(new MockHttpServletRequest()).data()).isNull();
    }
}
