package com.cyberbrain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DocumentRequest(
        @NotBlank(message = "Tiêu đề không được để trống")
        @Size(max = 500, message = "Tiêu đề tối đa 500 ký tự")
        String title,

        @NotBlank(message = "Nội dung không được để trống")
        String content,

        @Size(max = 1000, message = "Tóm tắt tối đa 1000 ký tự")
        String summary,

        List<Long> tagIds,

        Boolean isPublished) {
}
