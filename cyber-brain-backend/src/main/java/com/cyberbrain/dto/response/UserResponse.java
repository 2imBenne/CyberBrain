package com.cyberbrain.dto.response;

import com.cyberbrain.entity.User;

import java.time.LocalDateTime;

public record UserResponse(Long id, String username, String email, String role, String avatarUrl,
                           LocalDateTime createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                user.getRole().name(), user.getAvatarUrl(), user.getCreatedAt());
    }
}
