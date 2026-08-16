package com.cyberbrain.controller;

import com.cyberbrain.dto.ApiResponse;
import com.cyberbrain.dto.response.SearchHit;
import com.cyberbrain.dto.response.Suggestion;
import com.cyberbrain.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Full-text search PostgreSQL (TSVECTOR + GIN)")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Tìm kiếm full-text với đoạn trích highlight <mark>")
    public ResponseEntity<ApiResponse<List<SearchHit>>> search(
            @RequestParam String q,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(searchService.search(q, tag, limit)));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Gợi ý autocomplete theo tiêu đề")
    public ResponseEntity<ApiResponse<List<Suggestion>>> suggestions(
            @RequestParam String q,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(searchService.suggestions(q, limit)));
    }
}
