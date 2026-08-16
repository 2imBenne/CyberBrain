package com.cyberbrain.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record LayoutRequest(@NotNull @Valid List<NodePosition> nodes) {

    public record NodePosition(
            @NotNull Long id,
            Double x,
            Double y,
            Double z) {
    }
}
