package com.cyberbrain.dto.response;

import com.cyberbrain.entity.Document;

import java.util.List;

public record DocNodeResponse(Long id, String title, String slug, int viewCount, List<TagLight> tags) {

    public static DocNodeResponse from(Document doc) {
        return new DocNodeResponse(doc.getId(), doc.getTitle(), doc.getSlug(), doc.getViewCount(),
                doc.getTags().stream().map(TagLight::from).toList());
    }
}
