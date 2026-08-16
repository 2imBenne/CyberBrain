package com.cyberbrain.dto;

import java.time.LocalDateTime;

/**
 * Envelope thống nhất cho mọi API response: { status, data, message, timestamp }
 */
public record ApiResponse<T>(int status, T data, String message, LocalDateTime timestamp) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(200, data, "success", LocalDateTime.now());
    }

    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(201, data, "created", LocalDateTime.now());
    }

    public static <T> ApiResponse<T> message(int status, String message) {
        return new ApiResponse<>(status, null, message, LocalDateTime.now());
    }
}
