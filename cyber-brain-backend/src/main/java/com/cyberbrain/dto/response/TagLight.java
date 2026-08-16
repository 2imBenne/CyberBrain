package com.cyberbrain.dto.response;

import com.cyberbrain.entity.Tag;

public record TagLight(Long id, String name, String slug, String color, String icon) {

    public static TagLight from(Tag tag) {
        return new TagLight(tag.getId(), tag.getName(), tag.getSlug(), tag.getColor(), tag.getIcon());
    }
}
