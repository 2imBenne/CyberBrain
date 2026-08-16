package com.cyberbrain.dto.response;

import com.cyberbrain.entity.Bookmark;
import com.cyberbrain.entity.ReadingHistory;

import java.time.LocalDateTime;

public record UserActivityResponse(DocumentSummary document, LocalDateTime timestamp, Integer durationSec) {

    public static UserActivityResponse from(ReadingHistory history) {
        return new UserActivityResponse(DocumentSummary.from(history.getDocument()),
                history.getReadAt(), history.getDurationSec());
    }

    public static UserActivityResponse from(Bookmark bookmark) {
        return new UserActivityResponse(DocumentSummary.from(bookmark.getDocument()),
                bookmark.getCreatedAt(), null);
    }
}
