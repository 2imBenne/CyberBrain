package com.cyberbrain.service;

import com.cyberbrain.dto.PageResponse;
import com.cyberbrain.dto.response.UserActivityResponse;
import com.cyberbrain.dto.response.UserResponse;
import com.cyberbrain.entity.User;
import com.cyberbrain.repository.BookmarkRepository;
import com.cyberbrain.repository.ReadingHistoryRepository;
import com.cyberbrain.security.AuthenticatedUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final ReadingHistoryRepository readingHistoryRepository;
    private final BookmarkRepository bookmarkRepository;
    private final AuthenticatedUserResolver userResolver;

    @Transactional(readOnly = true)
    public UserResponse profile() {
        return UserResponse.from(userResolver.currentUser());
    }

    @Transactional(readOnly = true)
    public PageResponse<UserActivityResponse> history(int page, int size) {
        User user = userResolver.currentUser();
        Pageable pageable = PageRequest.of(Math.max(page, 0), clamp(size), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "readAt"));
        return PageResponse.from(readingHistoryRepository
                .findByUserIdOrderByReadAtDesc(user.getId(), pageable)
                .map(UserActivityResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserActivityResponse> bookmarks(int page, int size) {
        User user = userResolver.currentUser();
        Pageable pageable = PageRequest.of(Math.max(page, 0), clamp(size));
        return PageResponse.from(bookmarkRepository
                .findByIdUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(UserActivityResponse::from));
    }

    private int clamp(int size) {
        return Math.max(1, Math.min(size <= 0 ? 10 : size, 50));
    }
}
