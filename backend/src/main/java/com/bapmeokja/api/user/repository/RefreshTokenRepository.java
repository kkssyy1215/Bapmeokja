package com.bapmeokja.api.user.repository;

import com.bapmeokja.api.user.domain.RefreshToken;
import java.time.Instant;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from RefreshToken token join fetch token.user where token.tokenHash = :tokenHash")
    Optional<RefreshToken> findLockedByTokenHash(@Param("tokenHash") String tokenHash);

    void deleteByTokenHash(String tokenHash);

    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("delete from RefreshToken token where token.expiresAt <= :now")
    int deleteExpired(@Param("now") Instant now);
}
