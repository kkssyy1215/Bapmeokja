package com.bapmeokja.api.user.dto;

import com.bapmeokja.api.user.domain.DeviceRegistration.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DeviceRegistrationRequest(
        @NotBlank @Size(max = 512) String deviceToken,
        @NotNull Platform platform
) {
}
