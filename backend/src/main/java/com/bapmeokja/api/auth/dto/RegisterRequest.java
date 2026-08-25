package com.bapmeokja.api.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(min = 2, max = 20, message = "닉네임은 2~20자로 입력해주세요.")
        String nickname,

        @NotBlank(message = "이름을 입력해주세요.")
        @Size(max = 30, message = "이름은 30자 이하로 입력해주세요.")
        String name,

        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "이메일 형식을 확인해주세요.")
        @Size(max = 254, message = "이메일이 너무 깁니다.")
        String email,

        @NotBlank(message = "아이디를 입력해주세요.")
        @Pattern(regexp = "^[A-Za-z0-9]{4,20}$", message = "아이디는 영문과 숫자 4~20자로 입력해주세요.")
        String username,

        @NotBlank(message = "비밀번호를 입력해주세요.")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,72}$",
                message = "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다."
        )
        String password,

        @NotBlank(message = "비밀번호 확인을 입력해주세요.")
        String passwordConfirm,

        @AssertTrue(message = "이용약관 및 개인정보처리방침에 동의해주세요.")
        boolean agreeTerms,

        @AssertTrue(message = "이용약관 및 개인정보처리방침에 동의해주세요.")
        boolean agreePrivacy
) {
}
