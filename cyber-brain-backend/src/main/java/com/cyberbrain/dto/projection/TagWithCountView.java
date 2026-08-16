package com.cyberbrain.dto.projection;

public interface TagWithCountView {

    Long getId();

    String getName();

    String getSlug();

    String getColor();

    String getIcon();

    Long getParentId();

    Double getNodeX();

    Double getNodeY();

    Double getNodeZ();

    Long getDocCount();
}
