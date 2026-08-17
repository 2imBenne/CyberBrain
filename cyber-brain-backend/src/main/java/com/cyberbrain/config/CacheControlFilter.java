package com.cyberbrain.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Cache-Control cho các GET API tương đối "tĩnh" (tags, graph, danh sách, search)
 * để giảm tải cho Render free tier. Có chủ đích KHÔNG cache chi tiết document
 * (/api/documents/{slug}) vì cần tăng view_count và ghi reading history.
 */
@Component
@Order(2)
public class CacheControlFilter extends OncePerRequestFilter {

    private static final List<String> CACHEABLE_EXACT = List.of("/api/documents", "/api/graph");
    private static final List<String> CACHEABLE_PREFIXES = List.of("/api/tags/", "/api/search/");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("GET".equals(request.getMethod())) {
            String path = request.getRequestURI();
            boolean cacheable = CACHEABLE_EXACT.contains(path)
                    || CACHEABLE_PREFIXES.stream().anyMatch(path::startsWith);
            if (cacheable) {
                response.setHeader("Cache-Control", "public, max-age=60");
            }
        }

        filterChain.doFilter(request, response);
    }
}
