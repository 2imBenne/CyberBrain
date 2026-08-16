package com.cyberbrain.controller;

import com.cyberbrain.dto.ApiResponse;
import com.cyberbrain.dto.request.EdgeRequest;
import com.cyberbrain.dto.request.LayoutRequest;
import com.cyberbrain.dto.response.DocGraphResponse;
import com.cyberbrain.dto.response.GraphEdgeResponse;
import com.cyberbrain.dto.response.GraphResponse;
import com.cyberbrain.service.GraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/graph")
@RequiredArgsConstructor
@Tag(name = "Knowledge Graph", description = "Đồ tri thức cho visual 3D")
public class GraphController {

    private final GraphService graphService;

    @GetMapping
    @Operation(summary = "Toàn bộ graph: nodes = tags (kèm tọa độ 3D), edges = quan hệ")
    public ResponseEntity<ApiResponse<GraphResponse>> fullGraph() {
        return ResponseEntity.ok(ApiResponse.ok(graphService.fullGraph()));
    }

    @GetMapping("/document/{id}")
    @Operation(summary = "Subgraph BFS quanh một document (mặc định depth=2)")
    public ResponseEntity<ApiResponse<DocGraphResponse>> documentSubgraph(
            @PathVariable Long id,
            @RequestParam(defaultValue = "2") int depth) {
        return ResponseEntity.ok(ApiResponse.ok(graphService.documentSubgraph(id, depth)));
    }

    @PostMapping("/edges")
    @Operation(summary = "Tạo liên kết giữa 2 documents")
    public ResponseEntity<ApiResponse<GraphEdgeResponse>> createEdge(@Valid @RequestBody EdgeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(graphService.createEdge(request)));
    }

    @PatchMapping("/layout")
    @Operation(summary = "Lưu tọa độ layout 3D do client tính bằng d3-force")
    public ResponseEntity<ApiResponse<Void>> saveLayout(@Valid @RequestBody LayoutRequest request) {
        graphService.saveLayout(request);
        return ResponseEntity.ok(ApiResponse.message(200, "Đã lưu layout"));
    }
}
