package com.cyberbrain.controller;

import com.cyberbrain.dto.ApiResponse;
import com.cyberbrain.dto.PageResponse;
import com.cyberbrain.dto.request.TagRequest;
import com.cyberbrain.dto.response.DocumentSummary;
import com.cyberbrain.dto.response.TagResponse;
import com.cyberbrain.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "Quản lý tags phân cấp")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Danh sách tags kèm số lượng document")
    public ResponseEntity<ApiResponse<List<TagResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(tagService.list()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Chi tiết tag theo slug")
    public ResponseEntity<ApiResponse<TagResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(tagService.getBySlug(slug)));
    }

    @GetMapping("/{slug}/documents")
    @Operation(summary = "Tài liệu theo tag (phân trang)")
    public ResponseEntity<ApiResponse<PageResponse<DocumentSummary>>> documentsByTag(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(tagService.documentsByTag(slug, page, size, authentication)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo tag mới (ADMIN)")
    public ResponseEntity<ApiResponse<TagResponse>> create(@Valid @RequestBody TagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(tagService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật tag (ADMIN)")
    public ResponseEntity<ApiResponse<TagResponse>> update(@PathVariable Long id,
                                                           @Valid @RequestBody TagRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(tagService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa tag (ADMIN)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.ok(ApiResponse.message(200, "Đã xóa tag"));
    }
}
