package com.cyberbrain.dto.response;

import com.cyberbrain.dto.projection.TagWithCountView;

public record TagResponse(Long id, String name, String slug, String color, String icon, Long parentId,
                          Double nodeX, Double nodeY, Double nodeZ, long docCount) {

    public static TagResponse from(TagWithCountView view) {
        return new TagResponse(view.getId(), view.getName(), view.getSlug(), view.getColor(), view.getIcon(),
                view.getParentId(), view.getNodeX(), view.getNodeY(), view.getNodeZ(),
                view.getDocCount() == null ? 0 : view.getDocCount());
    }
}
