package com.cyberbrain.dto.response;

import com.cyberbrain.dto.projection.SearchHitView;

public record SearchHit(Long id, String title, String slug, String summary, String headline, double rank) {

    public static SearchHit from(SearchHitView view) {
        return new SearchHit(view.getId(), view.getTitle(), view.getSlug(), view.getSummary(),
                view.getHeadline(), view.getRank() == null ? 0 : view.getRank());
    }
}
