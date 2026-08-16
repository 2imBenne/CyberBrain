package com.cyberbrain.dto.response;

import com.cyberbrain.entity.Document;

import java.time.LocalDateTime;
import java.util.List;

public record DocumentSummary(Long id, String title, String slug, String summary, boolean isPublished,
                              boolean isPinned, int viewCount, AuthorRef author, List<TagLight> tags,
                              LocalDateTime createdAt, LocalDateTime updatedAt) {

    public static DocumentSummary from(Document doc) {
        return new DocumentSummary(
                doc.getId(), doc.getTitle(), doc.getSlug(), doc.getSummary(),
                doc.isPublished(), doc.isPinned(), doc.getViewCount(),
                AuthorRef.from(doc.getAuthor()),
                doc.getTags().stream().map(TagLight::from).toList(),
                doc.getCreatedAt(), doc.getUpdatedAt());
    }
}
