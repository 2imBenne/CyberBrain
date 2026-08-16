package com.cyberbrain.dto.response;

import com.cyberbrain.entity.Document;

import java.time.LocalDateTime;
import java.util.List;

public record DocumentResponse(Long id, String title, String slug, String content, String contentHtml,
                               String summary, boolean isPublished, boolean isPinned, int viewCount,
                               int readingMinutes, AuthorRef author, List<TagLight> tags,
                               LocalDateTime createdAt, LocalDateTime updatedAt) {

    public static DocumentResponse from(Document doc) {
        return new DocumentResponse(
                doc.getId(), doc.getTitle(), doc.getSlug(), doc.getContent(), doc.getContentHtml(),
                doc.getSummary(), doc.isPublished(), doc.isPinned(), doc.getViewCount(),
                estimateReadingMinutes(doc.getContent()),
                AuthorRef.from(doc.getAuthor()),
                doc.getTags().stream().map(TagLight::from).toList(),
                doc.getCreatedAt(), doc.getUpdatedAt());
    }

    private static int estimateReadingMinutes(String content) {
        if (content == null || content.isBlank()) {
            return 0;
        }
        return Math.max(1, (int) Math.ceil(content.length() / 800.0));
    }
}
