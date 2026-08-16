package com.cyberbrain.dto.response;

import com.cyberbrain.entity.User;

public record AuthorRef(Long id, String username) {

    public static AuthorRef from(User user) {
        return user == null ? null : new AuthorRef(user.getId(), user.getUsername());
    }
}
