package com.cyberbrain.security;

import com.cyberbrain.entity.User;
import com.cyberbrain.exception.ApiException;
import com.cyberbrain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticatedUserResolver {

    private final UserRepository userRepository;

    public User currentUser() {
        return fromAuthentication(SecurityContextHolder.getContext().getAuthentication());
    }

    public User currentUser(Authentication authentication) {
        return fromAuthentication(authentication);
    }

    public boolean isAuthenticated(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    private User fromAuthentication(Authentication authentication) {
        if (!isAuthenticated(authentication)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại"));
    }
}
