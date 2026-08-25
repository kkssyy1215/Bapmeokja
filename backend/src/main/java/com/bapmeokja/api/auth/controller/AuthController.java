package com.bapmeokja.api.auth.controller;

import com.bapmeokja.api.auth.dto.DuplicateCheckResponse;
import com.bapmeokja.api.auth.dto.LoginRequest;
import com.bapmeokja.api.auth.dto.LoginResponse;
import com.bapmeokja.api.auth.dto.RegisterRequest;
import com.bapmeokja.api.auth.dto.RegisterResponse;
import com.bapmeokja.api.auth.dto.TokenRefreshRequest;
import com.bapmeokja.api.auth.dto.TokenRefreshResponse;
import com.bapmeokja.api.auth.service.AuthService;
import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "인증")
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "로그인 성공");
    }

    @Operation(summary = "회원가입")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(authService.register(request), "회원가입이 완료되었습니다."));
    }

    @Operation(summary = "아이디 중복 확인")
    @GetMapping("/check/username")
    public ApiResponse<DuplicateCheckResponse> checkUsername(@RequestParam String value) {
        return duplicateResponse(authService.checkUsername(value));
    }

    @Operation(summary = "이메일 중복 확인")
    @GetMapping("/check/email")
    public ApiResponse<DuplicateCheckResponse> checkEmail(@RequestParam String value) {
        return duplicateResponse(authService.checkEmail(value));
    }

    @Operation(summary = "닉네임 중복 확인")
    @GetMapping("/check/nickname")
    public ApiResponse<DuplicateCheckResponse> checkNickname(@RequestParam String value) {
        return duplicateResponse(authService.checkNickname(value));
    }

    @Operation(summary = "JWT 토큰 재발급")
    @PostMapping("/token/refresh")
    public ApiResponse<TokenRefreshResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        return ApiResponse.success(authService.refresh(request.refreshToken()), "토큰이 재발급되었습니다.");
    }

    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@AuthenticationPrincipal UserPrincipal principal) {
        authService.logout(principal.id());
        return ApiResponse.successMessage("로그아웃 되었습니다.");
    }

    private ApiResponse<DuplicateCheckResponse> duplicateResponse(DuplicateCheckResponse response) {
        String message = response.isDuplicated() ? "이미 사용 중입니다." : "사용 가능합니다.";
        return ApiResponse.success(response, message);
    }
}
