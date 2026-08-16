package com.cyberbrain.dto.response;

public record GraphNodeResponse(Long id, String name, String slug, String color, String icon,
                                double x, double y, double z, long docCount) {
}
