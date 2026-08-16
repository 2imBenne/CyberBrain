package com.cyberbrain.dto.request;

import jakarta.validation.constraints.NotNull;

public record EdgeRequest(
        @NotNull(message = "sourceId không được để trống") Long sourceId,
        @NotNull(message = "targetId không được để trống") Long targetId,
        @NotNull(message = "relationType không được để trống") String relationType,
        Double weight,
        Boolean isBidirectional) {
}
