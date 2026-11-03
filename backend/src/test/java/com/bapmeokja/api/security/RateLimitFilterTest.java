package com.bapmeokja.api.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {
    private final JsonSecurityErrorWriter writer =
            new JsonSecurityErrorWriter(new ObjectMapper().findAndRegisterModules());
    private RateLimitProperties properties;
    private MutableClock clock;
    private RateLimitFilter filter;

    @BeforeEach
    void setUp() {
        properties = new RateLimitProperties();
        properties.setAuthPerMinute(2);
        properties.setAnalyzePerMinute(1);
        clock = new MutableClock();
        filter = new RateLimitFilter(properties, writer, clock);
    }

    @Test
    void blocksLoginAttemptsOverTheLimitWithAJsonError() throws Exception {
        assertThat(send("POST", "/v1/auth/login", "1.1.1.1").getStatus()).isEqualTo(200);
        assertThat(send("POST", "/v1/auth/login", "1.1.1.1").getStatus()).isEqualTo(200);

        MockHttpServletResponse blocked = send("POST", "/v1/auth/login", "1.1.1.1");

        assertThat(blocked.getStatus()).isEqualTo(429);
        assertThat(blocked.getHeader("Retry-After")).isEqualTo("60");
        assertThat(blocked.getContentAsString()).contains("RATE_001");
    }

    @Test
    void countsEachClientSeparatelyAndResetsAfterAMinute() throws Exception {
        send("POST", "/v1/auth/login", "1.1.1.1");
        send("POST", "/v1/auth/login", "1.1.1.1");
        assertThat(send("POST", "/v1/auth/login", "2.2.2.2").getStatus()).isEqualTo(200);
        assertThat(send("POST", "/v1/auth/login", "1.1.1.1").getStatus()).isEqualTo(429);

        clock.advance(Duration.ofSeconds(60));

        assertThat(send("POST", "/v1/auth/login", "1.1.1.1").getStatus()).isEqualTo(200);
    }

    @Test
    void limitsPhotoAnalysisSeparatelyToProtectTheFreeQuota() throws Exception {
        assertThat(send("POST", "/v1/diet/analyze", "1.1.1.1").getStatus()).isEqualTo(200);
        assertThat(send("POST", "/v1/community/analyze-image", "1.1.1.1").getStatus()).isEqualTo(429);
    }

    @Test
    void leavesOtherRequestsAlone() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertThat(send("GET", "/v1/home/dashboard", "1.1.1.1").getStatus()).isEqualTo(200);
        }
    }

    @Test
    void canBeDisabledForLocalTestRuns() throws Exception {
        properties.setEnabled(false);
        for (int i = 0; i < 5; i++) {
            assertThat(send("POST", "/v1/auth/login", "1.1.1.1").getStatus()).isEqualTo(200);
        }
    }

    private MockHttpServletResponse send(String method, String path, String address) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRemoteAddr(address);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-11-03T00:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public java.time.ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
