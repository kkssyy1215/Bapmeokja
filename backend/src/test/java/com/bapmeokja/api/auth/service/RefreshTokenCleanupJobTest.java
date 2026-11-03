package com.bapmeokja.api.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.user.repository.RefreshTokenRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class RefreshTokenCleanupJobTest {

    // 회귀 테스트(BUG-002): 만료된 refresh token 정리 쿼리가 현재 시각 기준으로 실제 호출되어야 한다.
    @Test
    void deletesTokensExpiredAtCurrentTime() {
        RefreshTokenRepository repository = mock(RefreshTokenRepository.class);
        Instant now = Instant.parse("2026-10-14T19:00:00Z");
        when(repository.deleteExpired(now)).thenReturn(3);
        RefreshTokenCleanupJob job = new RefreshTokenCleanupJob(repository, Clock.fixed(now, ZoneOffset.UTC));

        int deleted = job.deleteExpiredTokens();

        assertThat(deleted).isEqualTo(3);
        verify(repository).deleteExpired(now);
    }
}
