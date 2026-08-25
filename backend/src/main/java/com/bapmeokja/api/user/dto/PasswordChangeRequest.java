package com.bapmeokja.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PasswordChangeRequest(
        @NotBlank(message = "현재 비밀번호를 입력해주세요.") String currentPassword,
        @NotBlank(message = "새 비밀번호를 입력해주세요.")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,72}$",
                message = "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다."
        )
        String newPassword,
        @NotBlank(message = "새 비밀번호 확인을 입력해주세요.") String newPasswordConfirm
) {
}
