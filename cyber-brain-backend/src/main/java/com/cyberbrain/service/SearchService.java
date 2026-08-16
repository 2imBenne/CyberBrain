package com.cyberbrain.service;

import com.cyberbrain.dto.projection.SearchHitView;
import com.cyberbrain.dto.response.SearchHit;
import com.cyberbrain.dto.response.Suggestion;
import com.cyberbrain.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final DocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public List<SearchHit> search(String query, String tagSlug, int limit) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        String q = query.trim();
        if (q.length() < 2) {
            return List.of();
        }
        int clampedLimit = Math.max(1, Math.min(limit <= 0 ? 20 : limit, 50));
        List<SearchHitView> hits = (tagSlug != null && !tagSlug.isBlank())
                ? documentRepository.searchWithTag(q, tagSlug.trim(), clampedLimit)
                : documentRepository.search(q, clampedLimit);
        return hits.stream().map(SearchHit::from).toList();
    }

    @Transactional(readOnly = true)
    public List<Suggestion> suggestions(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        int clampedLimit = Math.max(1, Math.min(limit <= 0 ? 8 : limit, 20));
        return documentRepository.suggest(query.trim(), clampedLimit).stream()
                .map(Suggestion::from)
                .toList();
    }
}
