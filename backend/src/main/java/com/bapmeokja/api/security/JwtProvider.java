package com.bapmeokja.api.security;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.user.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    private static final String CLAIM_USERNAME = "username";
    private static final String CLAIM_TOKEN_TYPE = "tokenType";
    private static final String ISSUER = "bapmeokja-api";
    private static final String ACCESS = "ACCESS";
    private static final String REFRESH = "REFRESH";

    private final JwtProperties properties;
    private SecretKey signingKey;

    @PostConstruct
    void initialize() {
        if (properties.getSecret() == null
                || properties.getSecret().getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
        }
        signingKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public TokenPair issue(User user) {
        Instant now = Instant.now();
        Instant accessExpiresAt = now.plusSeconds(properties.getAccessTokenSeconds());
        Instant refreshExpiresAt = now.plusSeconds(properties.getRefreshTokenSeconds());
        String subject = String.valueOf(user.getId());

        String accessToken = buildToken(subject, user.getUsername(), ACCESS, now, accessExpiresAt);
        String refreshToken = buildToken(subject, user.getUsername(), REFRESH, now, refreshExpiresAt);
        return new TokenPair(accessToken, refreshToken, refreshExpiresAt);
    }

    public UserPrincipal parseAccessToken(String token) {
        ParsedToken parsedToken = parse(token);
        if (!ACCESS.equals(parsedToken.tokenType())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return new UserPrincipal(parsedToken.userId(), parsedToken.username());
    }

    public ParsedToken parseRefreshToken(String token) {
        ParsedToken parsedToken = parse(token);
        if (!REFRESH.equals(parsedToken.tokenType())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return parsedToken;
    }

    private String buildToken(
            String subject,
            String username,
            String tokenType,
            Instant issuedAt,
            Instant expiresAt
    ) {
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(ISSUER)
                .subject(subject)
                .claim(CLAIM_USERNAME, username)
                .claim(CLAIM_TOKEN_TYPE, tokenType)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    private ParsedToken parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return new ParsedToken(
                    Long.parseLong(claims.getSubject()),
                    claims.get(CLAIM_USERNAME, String.class),
                    claims.get(CLAIM_TOKEN_TYPE, String.class),
                    claims.getExpiration().toInstant()
            );
        } catch (BusinessException exception) {
            throw exception;
        } catch (JwtException | IllegalArgumentException exception) {
            throw exception;
        }
    }

    public record ParsedToken(Long userId, String username, String tokenType, Instant expiresAt) {
    }
}
