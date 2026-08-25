package com.bapmeokja.api.user.controller;

import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.user.dto.AccountDeleteRequest;
import com.bapmeokja.api.user.dto.BudgetUpdateRequest;
import com.bapmeokja.api.user.dto.DeviceRegistrationRequest;
import com.bapmeokja.api.user.dto.InitialProfileRequest;
import com.bapmeokja.api.user.dto.LocationConsentRequest;
import com.bapmeokja.api.user.dto.LocationConsentResponse;
import com.bapmeokja.api.user.dto.NotificationUpdateRequest;
import com.bapmeokja.api.user.dto.NutritionGoalResponse;
import com.bapmeokja.api.user.dto.PasswordChangeRequest;
import com.bapmeokja.api.user.dto.ProfileResponse;
import com.bapmeokja.api.user.dto.ProfileUpdateRequest;
import com.bapmeokja.api.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "사용자")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "초기 신체정보 등록")
    @PostMapping("/profile/initial")
    public ApiResponse<NutritionGoalResponse> initializeProfile(
            @Valid @RequestBody InitialProfileRequest request
    ) {
        return ApiResponse.success(userService.initializeProfile(request), "신체정보가 저장되었습니다.");
    }

    @Operation(summary = "프로필 조회")
    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> getProfile() {
        return ApiResponse.success(userService.getProfile(), "조회 성공");
    }

    @Operation(summary = "프로필 수정")
    @PutMapping("/profile")
    public ApiResponse<NutritionGoalResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ApiResponse.success(userService.updateProfile(request), "프로필이 수정되었습니다.");
    }

    @Operation(summary = "알림 설정 수정")
    @PutMapping("/settings/notification")
    public ApiResponse<Void> updateNotification(@Valid @RequestBody NotificationUpdateRequest request) {
        userService.updateNotification(request);
        return ApiResponse.successMessage("알림 설정이 저장되었습니다.");
    }

    @Operation(summary = "기본 예산 설정")
    @PutMapping("/settings/budget")
    public ApiResponse<Void> updateBudget(@Valid @RequestBody BudgetUpdateRequest request) {
        userService.updateBudget(request);
        return ApiResponse.successMessage("예산 기본값이 저장되었습니다.");
    }

    @Operation(summary = "위치 정보 이용 동의 저장")
    @PostMapping("/location-consent")
    public ApiResponse<LocationConsentResponse> updateLocationConsent(
            @Valid @RequestBody LocationConsentRequest request
    ) {
        return ApiResponse.success(
                userService.updateLocationConsent(request.agreed()),
                "설정이 저장되었습니다."
        );
    }

    @Operation(summary = "푸시 알림 디바이스 등록")
    @PostMapping("/devices")
    public ApiResponse<Void> registerDevice(@Valid @RequestBody DeviceRegistrationRequest request) {
        userService.registerDevice(request);
        return ApiResponse.successMessage("디바이스가 등록되었습니다.");
    }

    @Operation(summary = "비밀번호 변경")
    @PutMapping("/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        userService.changePassword(request);
        return ApiResponse.successMessage("비밀번호가 변경되었습니다.");
    }

    @Operation(summary = "회원 탈퇴")
    @DeleteMapping("/account")
    public ApiResponse<Void> deleteAccount(@Valid @RequestBody AccountDeleteRequest request) {
        userService.deleteAccount(request);
        return ApiResponse.successMessage("회원 탈퇴가 완료되었습니다.");
    }
}
