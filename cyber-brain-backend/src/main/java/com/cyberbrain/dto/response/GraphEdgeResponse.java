package com.cyberbrain.dto.response;

public record GraphEdgeResponse(Long source, Long target, String relationType, double weight) {
}
