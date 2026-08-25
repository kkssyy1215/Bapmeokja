package com.bapmeokja.api.auth.service;

import com.bapmeokja.api.auth.dto.DuplicateCheckResponse;
import com.bapmeokja.api.auth.dto.LoginRequest;
import com.bapmeokja.api.auth.dto.LoginResponse;
import com.bapmeokja.api.auth.dto.RegisterRequest;
import com.bapmeokja.api.auth.dto.RegisterResponse;
import com.bapmeokja.api.auth.dto.TokenRefreshResponse;
import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.security.JwtProvider;
import com.bapmeokja.api.security.TokenPair;
import com.bapmeokja.api.user.domain.NotificationSetting;
import com.bapmeokja.api.user.domain.RefreshToken;
import com.bapmeokja.api.user.domain.User;
import com.bapmeokja.api.user.repository.NotificationSettingRepository;
import com.bapmeokja.api.user.repository.RefreshTokenRepository;
import com.bapmeokja.api.user.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final TokenHashService tokenHashService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        validateRegistration(request);

        User user = User.create(
                request.username(),
                passwordEncoder.encode(request.password()),
                request.email(),
                request.name(),
                request.nickname(),
                request.agreeTerms(),
                request.agreePrivacy()
        );

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException(ErrorCode.DUPLICATED_USER_VALUE);
        }
        notificationSettingRepository.save(NotificationSetting.defaults(user));
        return new RegisterResponse(toExternalId(user.getId()), user.getNickname(), true);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        TokenPair pair = issueAndStore(user);
        return new LoginResponse(
                pair.accessToken(),
                pair.refreshToken(),
                user.isNewUser(),
                toExternalId(user.getId()),
                user.getNickname()
        );
    }

    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkUsername(String value) {
        return new DuplicateCheckResponse(userRepository.existsByUsername(requireValue(value)));
    }

    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkEmail(String value) {
        String email = requireValue(value);
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "이메일 형식을 확인해주세요.");
        }
        return new DuplicateCheckResponse(userRepository.existsByEmail(email));
    }

    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkNickname(String value) {
        return new DuplicateCheckResponse(userRepository.existsByNickname(requireValue(value)));
    }

    @Transactional
    public TokenRefreshResponse refresh(String rawRefreshToken) {
        JwtProvider.ParsedToken parsed;
        try {
            parsed = jwtProvider.parseRefreshToken(rawRefreshToken);
        } catch (ExpiredJwtException exception) {
            refreshTokenRepository.deleteByTokenHash(tokenHashService.hash(rawRefreshToken));
            throw new BusinessException(ErrorCode.EXPIRED_TOKEN);
        } catch (BusinessException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        String tokenHash = tokenHashService.hash(rawRefreshToken);
        RefreshToken savedToken = refreshTokenRepository.findLockedByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        if (!savedToken.getUser().getId().equals(parsed.userId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        if (savedToken.isExpired(Instant.now())) {
            refreshTokenRepository.delete(savedToken);
            throw new BusinessException(ErrorCode.EXPIRED_TOKEN);
        }

        User user = savedToken.getUser();
        refreshTokenRepository.delete(savedToken);
        TokenPair pair = issueAndStore(user);
        return new TokenRefreshResponse(pair.accessToken(), pair.refreshToken());
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteAllByUserId(userId);
    }

    private TokenPair issueAndStore(User user) {
        TokenPair pair = jwtProvider.issue(user);
        refreshTokenRepository.save(RefreshToken.issue(
                user,
                tokenHashService.hash(pair.refreshToken()),
                pair.refreshTokenExpiresAt()
        ));
        return pair;
    }

    private void validateRegistration(RegisterRequest request) {
        if (!request.password().equals(request.passwordConfirm())) {
            throw new BusinessException(ErrorCode.PASSWORD_CONFIRM_MISMATCH);
        }
        if (!request.agreeTerms() || !request.agreePrivacy()) {
            throw new BusinessException(ErrorCode.TERMS_REQUIRED);
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException(ErrorCode.DUPLICATED_USER_VALUE, "이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.DUPLICATED_USER_VALUE, "이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByNickname(request.nickname())) {
            throw new BusinessException(ErrorCode.DUPLICATED_USER_VALUE, "이미 사용 중인 닉네임입니다.");
        }
    }

    private String requireValue(String value) {
        if (value == null || value.isBlank()) {
            throw new BusinessException(ErrorCode.USERNAME_REQUIRED, "확인할 값을 입력해주세요.");
        }
        return value.trim();
    }

    private String toExternalId(Long id) {
        return "u_" + id;
    }
}
