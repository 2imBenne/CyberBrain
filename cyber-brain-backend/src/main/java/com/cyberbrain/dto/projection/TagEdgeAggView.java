package com.cyberbrain.dto.projection;

public interface TagEdgeAggView {

    Long getSourceTag();

    Long getTargetTag();

    Double getWeight();

    String getRelationType();
}
