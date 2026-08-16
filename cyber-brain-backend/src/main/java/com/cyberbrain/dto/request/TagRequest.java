package com.cyberbrain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TagRequest(
        @NotBlank(message = "Tên tag không được để trống")
        @Size(max = 100, message = "Tên tag tối đa 100 ký tự")
        String name,

        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Color phải là mã hex, ví dụ #00d4ff")
        String color,

        String icon,

        Long parentId) {
}
