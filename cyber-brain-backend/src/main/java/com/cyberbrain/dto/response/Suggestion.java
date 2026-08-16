package com.cyberbrain.dto.response;

import com.cyberbrain.dto.projection.SuggestionView;

public record Suggestion(Long id, String title, String slug) {

    public static Suggestion from(SuggestionView view) {
        return new Suggestion(view.getId(), view.getTitle(), view.getSlug());
    }
}
