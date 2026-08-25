package com.bapmeokja.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.auth.dto.LoginRequest;
import com.bapmeokja.api.auth.dto.RegisterRequest;
import com.bapmeokja.api.auth.dto.RegisterResponse;
import com.bapmeokja.api.auth.service.AuthService;
import com.bapmeokja.api.auth.service.TokenHashService;
import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.security.JwtProvider;
import com.bapmeokja.api.user.domain.NotificationSetting;
import com.bapmeokja.api.user.domain.User;
import com.bapmeokja.api.user.repository.NotificationSettingRepository;
import com.bapmeokja.api.user.repository.RefreshTokenRepository;
import com.bapmeokja.api.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock NotificationSettingRepository notificationSettingRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtProvider jwtProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                notificationSettingRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtProvider,
                new TokenHashService()
        );
    }

    @Test
    void registersUserWithDefaultNotificationSettings() {
        RegisterRequest request = new RegisterRequest(
                "건강토마토", "홍길동", "hong@example.com", "user123",
                "Password1!", "Password1!", true, true
        );
        when(passwordEncoder.encode(request.password())).thenReturn("encoded");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 1L);
            return saved;
        });

        RegisterResponse response = authService.register(request);

        assertThat(response.userId()).isEqualTo("u_1");
        assertThat(response.isNewUser()).isTrue();
        verify(notificationSettingRepository).save(any(NotificationSetting.class));
    }

    @Test
    void rejectsWrongLoginPasswordWithoutRevealingUsernameExistence() {
        User user = User.create("user123", "encoded", "hong@example.com", "홍길동", "건강토마토", true, true);
        when(userRepository.findByUsername("user123")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("user123", "wrong")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("아이디 또는 비밀번호를 확인해주세요.");
    }
}
