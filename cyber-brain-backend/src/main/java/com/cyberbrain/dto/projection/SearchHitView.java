package com.cyberbrain.dto.projection;

public interface SearchHitView {

    Long getId();

    String getTitle();

    String getSlug();

    String getSummary();

    Double getRank();

    String getHeadline();
}
