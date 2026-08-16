package com.cyberbrain.controller;

import com.cyberbrain.dto.ApiResponse;
import com.cyberbrain.dto.PageResponse;
import com.cyberbrain.dto.response.UserActivityResponse;
import com.cyberbrain.dto.response.UserResponse;
import com.cyberbrain.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Profile, lịch sử đọc, bookmarks")
public class UserController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    @Operation(summary = "Thông tin người dùng hiện tại")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        return ResponseEntity.ok(ApiResponse.ok(userProfileService.profile()));
    }

    @GetMapping("/me/history")
    @Operation(summary = "Lịch sử đọc (phân trang)")
    public ResponseEntity<ApiResponse<PageResponse<UserActivityResponse>>> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(userProfileService.history(page, size)));
    }

    @GetMapping("/me/bookmarks")
    @Operation(summary = "Danh sách bookmark (phân trang)")
    public ResponseEntity<ApiResponse<PageResponse<UserActivityResponse>>> bookmarks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(userProfileService.bookmarks(page, size)));
    }
}
