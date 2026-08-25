package com.bapmeokja.api.user.dto;

import jakarta.validation.constraints.NotNull;

public record LocationConsentRequest(@NotNull Boolean agreed) {
}
