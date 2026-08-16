package com.cyberbrain.controller;

import com.cyberbrain.dto.ApiResponse;
import com.cyberbrain.dto.PageResponse;
import com.cyberbrain.dto.request.DocumentRequest;
import com.cyberbrain.dto.request.TagsUpdateRequest;
import com.cyberbrain.dto.response.BookmarkToggleResponse;
import com.cyberbrain.dto.response.DocumentResponse;
import com.cyberbrain.dto.response.DocumentSummary;
import com.cyberbrain.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "CRUD tài liệu knowledge base")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    @Operation(summary = "Tạo tài liệu mới (auto-slug, render Markdown → HTML)")
    public ResponseEntity<ApiResponse<DocumentResponse>> create(@Valid @RequestBody DocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(documentService.create(request)));
    }

    @GetMapping("/mine")
    @Operation(summary = "Danh sách tài liệu của tôi (kèm draft chưa publish)")
    public ResponseEntity<ApiResponse<PageResponse<DocumentSummary>>> mine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.list(page, size, null, sort, authentication, true)));
    }

    @GetMapping
    @Operation(summary = "Danh sách tài liệu (phân trang, lọc theo tag, sắp xếp)")
    public ResponseEntity<ApiResponse<PageResponse<DocumentSummary>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String sort,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.list(page, size, tag, sort, authentication, false)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Chi tiết tài liệu theo slug (tăng view_count, ghi reading history)")
    public ResponseEntity<ApiResponse<DocumentResponse>> getBySlug(@PathVariable String slug,
                                                                   Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.getBySlug(slug, authentication)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật tài liệu (chỉ author hoặc ADMIN)")
    public ResponseEntity<ApiResponse<DocumentResponse>> update(@PathVariable Long id,
                                                                @Valid @RequestBody DocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete tài liệu (chỉ author hoặc ADMIN)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        documentService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.message(200, "Đã xóa tài liệu"));
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Publish / Unpublish tài liệu")
    public ResponseEntity<ApiResponse<DocumentResponse>> publish(@PathVariable Long id,
                                                                 @RequestParam(defaultValue = "true") boolean published) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.setPublished(id, published)));
    }

    @PostMapping("/{id}/tags")
    @Operation(summary = "Gán lại danh sách tags cho tài liệu")
    public ResponseEntity<ApiResponse<DocumentSummary>> setTags(@PathVariable Long id,
                                                                @RequestBody TagsUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.setTags(id, request.tagIds())));
    }

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Toggle bookmark tài liệu")
    public ResponseEntity<ApiResponse<BookmarkToggleResponse>> toggleBookmark(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.toggleBookmark(id)));
    }
}
