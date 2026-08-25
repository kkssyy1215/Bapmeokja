package com.bapmeokja.api.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.user.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtProviderTest {

    private JwtProvider jwtProvider;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("test-secret-key-must-be-at-least-thirty-two-characters");
        properties.setAccessTokenSeconds(3600);
        properties.setRefreshTokenSeconds(7200);
        jwtProvider = new JwtProvider(properties);
        jwtProvider.initialize();
    }

    @Test
    void issuesAndParsesAccessToken() {
        User user = User.create("user123", "encoded", "a@example.com", "홍길동", "토마토", true, true);
        ReflectionTestUtils.setField(user, "id", 42L);

        TokenPair pair = jwtProvider.issue(user);
        UserPrincipal principal = jwtProvider.parseAccessToken(pair.accessToken());

        assertThat(principal.id()).isEqualTo(42L);
        assertThat(principal.username()).isEqualTo("user123");
        assertThat(pair.refreshToken()).isNotBlank();
    }

    @Test
    void refusesRefreshTokenInAuthorizationHeader() {
        User user = User.create("user123", "encoded", "a@example.com", "홍길동", "토마토", true, true);
        ReflectionTestUtils.setField(user, "id", 42L);
        TokenPair pair = jwtProvider.issue(user);

        assertThatThrownBy(() -> jwtProvider.parseAccessToken(pair.refreshToken()))
                .isInstanceOf(BusinessException.class);
    }
}
