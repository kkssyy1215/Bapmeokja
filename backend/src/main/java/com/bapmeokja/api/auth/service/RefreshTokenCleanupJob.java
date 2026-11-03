package com.bapmeokja.api.auth.service;

import com.bapmeokja.api.user.repository.RefreshTokenRepository;
import java.time.Clock;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 로그인마다 refresh token 행이 새로 저장되고, 로그아웃이나 재발급 없이 버려진 토큰은 만료 후에도 남는다.
 * 매일 새벽 만료된 토큰을 일괄 삭제해 refresh_tokens 테이블이 계속 커지지 않게 한다.
 */
@Slf4j
@Component
public class RefreshTokenCleanupJob {

    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock;

    @Autowired
    public RefreshTokenCleanupJob(RefreshTokenRepository refreshTokenRepository) {
        this(refreshTokenRepository, Clock.systemUTC());
    }

    RefreshTokenCleanupJob(RefreshTokenRepository refreshTokenRepository, Clock clock) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.clock = clock;
    }

    @Transactional
    @Scheduled(cron = "${app.jwt.cleanup-cron:0 0 4 * * *}", zone = "Asia/Seoul")
    public int deleteExpiredTokens() {
        int deleted = refreshTokenRepository.deleteExpired(Instant.now(clock));
        if (deleted > 0) {
            log.info("Deleted {} expired refresh tokens", deleted);
        }
        return deleted;
    }
}
