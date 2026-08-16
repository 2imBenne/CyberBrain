package com.cyberbrain.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
        @NotBlank(message = "refreshToken không được để trống") String refreshToken) {
}
