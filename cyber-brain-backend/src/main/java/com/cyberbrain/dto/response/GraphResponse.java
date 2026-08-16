package com.cyberbrain.dto.response;

import java.util.List;

public record GraphResponse(List<GraphNodeResponse> nodes, List<GraphEdgeResponse> edges) {
}
