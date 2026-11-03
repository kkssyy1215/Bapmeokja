package com.bapmeokja.api.user.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.community.CommunityImageStorage;
import com.bapmeokja.api.community.CommunityPostRepository;
import com.bapmeokja.api.diet.repository.AiAnalysisRepository;
import com.bapmeokja.api.diet.service.DietImageStorage;
import com.bapmeokja.api.user.domain.ActivityLevel;
import com.bapmeokja.api.user.domain.Gender;
import com.bapmeokja.api.user.domain.Goal;
import com.bapmeokja.api.user.domain.User;
import com.bapmeokja.api.user.dto.AccountDeleteRequest;
import com.bapmeokja.api.user.dto.BudgetUpdateRequest;
import com.bapmeokja.api.user.dto.InitialProfileRequest;
import com.bapmeokja.api.user.dto.PasswordChangeRequest;
import com.bapmeokja.api.user.dto.ProfileUpdateRequest;
import com.bapmeokja.api.user.repository.DeviceRegistrationRepository;
import com.bapmeokja.api.user.repository.NotificationSettingRepository;
import com.bapmeokja.api.user.repository.RefreshTokenRepository;
import com.bapmeokja.api.user.repository.UserRepository;
import java.util.List;
import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserServiceTest {
    private UserRepository userRepository;
    private NotificationSettingRepository notificationRepository;
    private RefreshTokenRepository refreshTokenRepository;
    private DeviceRegistrationRepository deviceRepository;
    private NutritionCalculator nutritionCalculator;
    private PasswordEncoder passwordEncoder;
    private CommunityPostRepository communityPostRepository;
    private CommunityImageStorage communityImageStorage;
    private AiAnalysisRepository aiAnalysisRepository;
    private DietImageStorage dietImageStorage;
    private User user;
    private UserService service;

    @BeforeEach
    void setUp() {
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        userRepository = mock(UserRepository.class);
        notificationRepository = mock(NotificationSettingRepository.class);
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        deviceRepository = mock(DeviceRegistrationRepository.class);
        nutritionCalculator = mock(NutritionCalculator.class);
        passwordEncoder = mock(PasswordEncoder.class);
        user = mock(User.class);
        when(user.getId()).thenReturn(7L);
        when(user.getPassword()).thenReturn("hash");
        when(currentUserService.getCurrentUser()).thenReturn(user);
        communityPostRepository = mock(CommunityPostRepository.class);
        communityImageStorage = mock(CommunityImageStorage.class);
        aiAnalysisRepository = mock(AiAnalysisRepository.class);
        dietImageStorage = mock(DietImageStorage.class);
        service = new UserService(currentUserService, userRepository, notificationRepository,
                refreshTokenRepository, deviceRepository, nutritionCalculator, passwordEncoder,
                communityPostRepository, communityImageStorage, aiAnalysisRepository, dietImageStorage);
    }

    @Test
    void passwordChangeRevokesEverySession() {
        when(passwordEncoder.matches("old", "hash")).thenReturn(true);
        when(passwordEncoder.encode("New!12345")).thenReturn("newHash");

        service.changePassword(new PasswordChangeRequest("old", "New!12345", "New!12345"));

        verify(user).changePassword("newHash");
        verify(refreshTokenRepository).deleteAllByUserId(7L);
    }

    @Test
    void passwordChangeRequiresTheCurrentPassword() {
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertFailsWith(ErrorCode.CURRENT_PASSWORD_MISMATCH,
                () -> service.changePassword(new PasswordChangeRequest("wrong", "New!12345", "New!12345")));
        verify(user, never()).changePassword(any());
    }

    @Test
    void passwordChangeRequiresMatchingConfirmation() {
        when(passwordEncoder.matches("old", "hash")).thenReturn(true);

        assertFailsWith(ErrorCode.PASSWORD_CONFIRM_MISMATCH,
                () -> service.changePassword(new PasswordChangeRequest("old", "New!12345", "Other!12345")));
        verify(refreshTokenRepository, never()).deleteAllByUserId(any());
    }

    @Test
    void accountDeletionRequiresThePasswordAndRemovesUserData() {
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);
        assertFailsWith(ErrorCode.CURRENT_PASSWORD_MISMATCH,
                () -> service.deleteAccount(new AccountDeleteRequest("wrong")));
        verify(userRepository, never()).delete(any());
        verify(communityPostRepository, never()).releaseCountersOfUser(any());

        when(passwordEncoder.matches("right", "hash")).thenReturn(true);
        when(communityPostRepository.findImageUrlsByUserId(7L)).thenReturn(List.of("/v1/uploads/community/a.jpg"));
        when(aiAnalysisRepository.findImageUrlsByUserId(7L)).thenReturn(List.of("/uploads/diet/b.jpg"));
        service.deleteAccount(new AccountDeleteRequest("right"));

        // 회귀 테스트(BUG-007, BUG-009): 카운터를 먼저 정리하고, 탈퇴자의 사진 파일도 지운다.
        verify(communityPostRepository).releaseCountersOfUser(7L);
        verify(communityImageStorage).delete("/v1/uploads/community/a.jpg");
        verify(dietImageStorage).delete("/uploads/diet/b.jpg");

        verify(refreshTokenRepository).deleteAllByUserId(7L);
        verify(deviceRepository).deleteAllByUserId(7L);
        verify(notificationRepository).deleteByUserId(7L);
        verify(userRepository).delete(user);
    }

    @Test
    void initialProfileCanOnlyBeRegisteredOnce() {
        when(user.isNewUser()).thenReturn(false);

        assertFailsWith(ErrorCode.INVALID_PARAMETER, () -> service.initializeProfile(profile(null)));
    }

    @Test
    void bodyFatMassMustBeSmallerThanWeight() {
        when(user.isNewUser()).thenReturn(true);

        assertFailsWith(ErrorCode.INVALID_PARAMETER, () -> service.initializeProfile(profile(60.0)));
        verifyNoInteractions(nutritionCalculator);
    }

    @Test
    void nicknameTakenByAnotherUserIsRejected() {
        when(user.getNickname()).thenReturn("밥풀");
        when(userRepository.existsByNicknameAndIdNot("토마토", 7L)).thenReturn(true);

        assertFailsWith(ErrorCode.DUPLICATED_USER_VALUE, () -> service.updateProfile(new ProfileUpdateRequest(
                "토마토", null, null, null, null, null, null, null, null, null)));
    }

    @Test
    void emptyBudgetUpdateIsRejectedAndValuesAreSaved() {
        assertFailsWith(ErrorCode.REQUIRED_VALUE_MISSING,
                () -> service.updateBudget(new BudgetUpdateRequest(null, null)));

        service.updateBudget(new BudgetUpdateRequest(12_000, null));

        verify(user).changeBudgets(12_000, null);
    }

    @Test
    void locationConsentReflectsTheStoredValue() {
        when(user.isLocationConsentGranted()).thenReturn(true);

        assertThat(service.updateLocationConsent(true).locationConsentGranted()).isTrue();
        verify(user).changeLocationConsent(true);
    }

    private InitialProfileRequest profile(Double bodyFatMass) {
        return new InitialProfileRequest(
                Gender.F, 23, 162.0, 55.0, ActivityLevel.LIGHT, Goal.MAINTAIN, null, bodyFatMass, null
        );
    }

    private void assertFailsWith(ErrorCode code, ThrowingCallable call) {
        assertThatThrownBy(call).isInstanceOfSatisfying(BusinessException.class,
                exception -> assertThat(exception.getErrorCode()).isEqualTo(code));
    }
}
