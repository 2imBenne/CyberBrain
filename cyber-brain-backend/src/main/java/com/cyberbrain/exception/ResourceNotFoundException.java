package com.cyberbrain.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, Object identifier) {
        super("%s không tồn tại: %s".formatted(resource, identifier));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
