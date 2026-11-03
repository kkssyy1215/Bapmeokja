package com.bapmeokja.api.user.service;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.community.CommunityImageStorage;
import com.bapmeokja.api.community.CommunityPostRepository;
import com.bapmeokja.api.diet.repository.AiAnalysisRepository;
import com.bapmeokja.api.diet.service.DietImageStorage;
import com.bapmeokja.api.user.domain.DeviceRegistration;
import com.bapmeokja.api.user.domain.NotificationSetting;
import com.bapmeokja.api.user.domain.NutritionGoals;
import com.bapmeokja.api.user.domain.User;
import com.bapmeokja.api.user.dto.AccountDeleteRequest;
import com.bapmeokja.api.user.dto.BudgetUpdateRequest;
import com.bapmeokja.api.user.dto.DeviceRegistrationRequest;
import com.bapmeokja.api.user.dto.InitialProfileRequest;
import com.bapmeokja.api.user.dto.LocationConsentResponse;
import com.bapmeokja.api.user.dto.NotificationUpdateRequest;
import com.bapmeokja.api.user.dto.NutritionGoalResponse;
import com.bapmeokja.api.user.dto.PasswordChangeRequest;
import com.bapmeokja.api.user.dto.ProfileResponse;
import com.bapmeokja.api.user.dto.ProfileUpdateRequest;
import com.bapmeokja.api.user.repository.DeviceRegistrationRepository;
import com.bapmeokja.api.user.repository.NotificationSettingRepository;
import com.bapmeokja.api.user.repository.RefreshTokenRepository;
import com.bapmeokja.api.user.repository.UserRepository;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final DeviceRegistrationRepository deviceRegistrationRepository;
    private final NutritionCalculator nutritionCalculator;
    private final PasswordEncoder passwordEncoder;
    private final CommunityPostRepository communityPostRepository;
    private final CommunityImageStorage communityImageStorage;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final DietImageStorage dietImageStorage;

    @Transactional
    public NutritionGoalResponse initializeProfile(InitialProfileRequest request) {
        User user = currentUserService.getCurrentUser();
        if (!user.isNewUser()) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "이미 초기 신체정보가 등록되어 있습니다.");
        }
        validateBodyComposition(request.weight(), request.bodyFatMass());
        NutritionGoals goals = nutritionCalculator.calculate(
                request.gender(), request.age(), request.height(), request.weight(),
                request.activityLevel(), request.goal(), request.skeletalMuscleMass(),
                request.bodyFatMass(), request.bodyFatPercentage()
        );
        user.initializeProfile(
                request.gender(), request.age(), request.height(), request.weight(),
                request.activityLevel(), request.goal(), request.skeletalMuscleMass(),
                request.bodyFatMass(), request.bodyFatPercentage(), goals
        );
        return NutritionGoalResponse.from(goals);
    }

    @Transactional
    public ProfileResponse getProfile() {
        User user = currentUserService.getCurrentUser();
        NotificationSetting notification = notificationSettingRepository.findByUserId(user.getId())
                .orElseGet(() -> notificationSettingRepository.save(NotificationSetting.defaults(user)));
        return ProfileResponse.of(user, notification);
    }

    @Transactional
    public NutritionGoalResponse updateProfile(ProfileUpdateRequest request) {
        User user = currentUserService.getCurrentUser();
        if (request.nickname() != null
                && !request.nickname().equals(user.getNickname())
                && userRepository.existsByNicknameAndIdNot(request.nickname(), user.getId())) {
            throw new BusinessException(ErrorCode.DUPLICATED_USER_VALUE, "이미 사용 중인 닉네임입니다.");
        }

        user.updateProfile(
                request.nickname(), request.gender(), request.age(), request.height(), request.weight(),
                request.activityLevel(), request.goal(), request.skeletalMuscleMass(),
                request.bodyFatMass(), request.bodyFatPercentage()
        );
        if (hasCompleteProfile(user)) {
            validateBodyComposition(user.getWeight(), user.getBodyFatMass());
            NutritionGoals goals = nutritionCalculator.calculate(
                    user.getGender(), user.getAge(), user.getHeight(), user.getWeight(),
                    user.getActivityLevel(), user.getGoal(), user.getSkeletalMuscleMass(),
                    user.getBodyFatMass(), user.getBodyFatPercentage()
            );
            user.applyNutritionGoals(goals);
            return NutritionGoalResponse.from(goals);
        }
        return new NutritionGoalResponse(
                user.getDailyCalorieGoal(), user.getCarbGoalGram(), user.getProteinGoalGram(),
                user.getFatGoalGram(), user.isPreciseMode()
        );
    }

    @Transactional
    public void updateNotification(NotificationUpdateRequest request) {
        User user = currentUserService.getCurrentUser();
        NotificationSetting setting = notificationSettingRepository.findByUserId(user.getId())
                .orElseGet(() -> NotificationSetting.defaults(user));
        setting.update(
                request.pushEnabled(),
                request.waterReminderEnabled(),
                parseTime(request.breakfastTime()),
                parseTime(request.lunchTime()),
                parseTime(request.dinnerTime()),
                request.expiryAlertEnabled()
        );
        notificationSettingRepository.save(setting);
    }

    @Transactional
    public void updateBudget(BudgetUpdateRequest request) {
        if (request.diningOut() == null && request.homeCooking() == null) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_MISSING, "설정할 예산을 입력해주세요.");
        }
        currentUserService.getCurrentUser().changeBudgets(request.diningOut(), request.homeCooking());
    }

    @Transactional
    public LocationConsentResponse updateLocationConsent(boolean agreed) {
        User user = currentUserService.getCurrentUser();
        user.changeLocationConsent(agreed);
        return new LocationConsentResponse(user.isLocationConsentGranted());
    }

    @Transactional
    public void registerDevice(DeviceRegistrationRequest request) {
        User user = currentUserService.getCurrentUser();
        DeviceRegistration device = deviceRegistrationRepository.findByDeviceToken(request.deviceToken())
                .orElseGet(() -> DeviceRegistration.register(user, request.deviceToken(), request.platform()));
        device.reassign(user, request.platform());
        deviceRegistrationRepository.save(device);
    }

    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        User user = currentUserService.getCurrentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_MISMATCH);
        }
        if (!request.newPassword().equals(request.newPasswordConfirm())) {
            throw new BusinessException(ErrorCode.PASSWORD_CONFIRM_MISMATCH);
        }
        user.changePassword(passwordEncoder.encode(request.newPassword()));
        refreshTokenRepository.deleteAllByUserId(user.getId());
    }

    @Transactional
    public void deleteAccount(AccountDeleteRequest request) {
        User user = currentUserService.getCurrentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_MISMATCH);
        }
        List<String> postImages = communityPostRepository.findImageUrlsByUserId(user.getId());
        List<String> mealImages = aiAnalysisRepository.findImageUrlsByUserId(user.getId());
        communityPostRepository.releaseCountersOfUser(user.getId());
        refreshTokenRepository.deleteAllByUserId(user.getId());
        deviceRegistrationRepository.deleteAllByUserId(user.getId());
        notificationSettingRepository.deleteByUserId(user.getId());
        userRepository.delete(user);
        afterCommit(() -> {
            postImages.forEach(communityImageStorage::delete);
            mealImages.forEach(dietImageStorage::delete);
        });
    }

    // DB 삭제가 롤백되면 사진은 남아 있어야 하므로 커밋 뒤에 파일을 지운다.
    private void afterCommit(Runnable task) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            task.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                task.run();
            }
        });
    }

    private boolean hasCompleteProfile(User user) {
        return user.getGender() != null
                && user.getAge() != null
                && user.getHeight() != null
                && user.getWeight() != null
                && user.getActivityLevel() != null
                && user.getGoal() != null;
    }

    private LocalTime parseTime(String value) {
        return value == null ? null : LocalTime.parse(value);
    }

    private void validateBodyComposition(Double weight, Double bodyFatMass) {
        if (bodyFatMass != null && bodyFatMass >= weight) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "지방량은 몸무게보다 작아야 합니다.");
        }
    }
}
