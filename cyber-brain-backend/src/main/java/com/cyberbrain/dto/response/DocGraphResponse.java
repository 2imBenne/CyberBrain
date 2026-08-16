package com.cyberbrain.dto.response;

import java.util.List;

public record DocGraphResponse(List<DocNodeResponse> nodes, List<GraphEdgeResponse> edges, int depth) {
}
