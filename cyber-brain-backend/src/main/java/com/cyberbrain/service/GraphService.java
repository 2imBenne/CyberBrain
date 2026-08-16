package com.cyberbrain.service;

import com.cyberbrain.dto.projection.TagEdgeAggView;
import com.cyberbrain.dto.projection.TagWithCountView;
import com.cyberbrain.dto.request.EdgeRequest;
import com.cyberbrain.dto.request.LayoutRequest;
import com.cyberbrain.dto.response.DocGraphResponse;
import com.cyberbrain.dto.response.DocNodeResponse;
import com.cyberbrain.dto.response.GraphEdgeResponse;
import com.cyberbrain.dto.response.GraphNodeResponse;
import com.cyberbrain.dto.response.GraphResponse;
import com.cyberbrain.entity.Document;
import com.cyberbrain.entity.KnowledgeGraphEdge;
import com.cyberbrain.entity.RelationType;
import com.cyberbrain.exception.ApiException;
import com.cyberbrain.exception.ResourceNotFoundException;
import com.cyberbrain.repository.DocumentRepository;
import com.cyberbrain.repository.KnowledgeGraphRepository;
import com.cyberbrain.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GraphService {

    private static final double LAYOUT_RADIUS = 40.0;

    private final TagRepository tagRepository;
    private final DocumentRepository documentRepository;
    private final KnowledgeGraphRepository knowledgeGraphRepository;

    @Transactional
    public GraphResponse fullGraph() {
        List<TagWithCountView> tagViews = tagRepository.findAllWithCount();

        List<GraphNodeResponse> nodes = new ArrayList<>();
        boolean hasMissingCoords = tagViews.stream().anyMatch(v -> v.getNodeX() == null);
        int total = tagViews.size();
        for (int i = 0; i < total; i++) {
            TagWithCountView view = tagViews.get(i);
            double x, y, z;
            if (view.getNodeX() == null || view.getNodeY() == null || view.getNodeZ() == null) {
                double[] coords = fibonacciSphere(i, total);
                x = coords[0];
                y = coords[1];
                z = coords[2];
                if (hasMissingCoords) {
                    tagRepository.updateNodePosition(view.getId(), x, y, z);
                }
            } else {
                x = view.getNodeX();
                y = view.getNodeY();
                z = view.getNodeZ();
            }
            nodes.add(new GraphNodeResponse(view.getId(), view.getName(), view.getSlug(),
                    view.getColor(), view.getIcon(), x, y, z,
                    view.getDocCount() == null ? 0 : view.getDocCount()));
        }

        // Gộp edge đồng xuất hiện (CO_OCCURS) và edge suy ra từ quan hệ document-document
        Map<String, GraphEdgeResponse> merged = new LinkedHashMap<>();
        mergeEdges(merged, knowledgeGraphRepository.findCoOccurrenceEdges());
        mergeEdges(merged, knowledgeGraphRepository.findDocumentRelationEdges());

        return new GraphResponse(nodes, new ArrayList<>(merged.values()));
    }

    @Transactional(readOnly = true)
    public DocGraphResponse documentSubgraph(Long documentId, int depth) {
        Document root = documentRepository.findByIdAndDeletedAtIsNull(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        List<KnowledgeGraphEdge> allEdges = knowledgeGraphRepository.findAllWithDocuments();

        Map<Long, List<KnowledgeGraphEdge>> adjacency = new HashMap<>();
        for (KnowledgeGraphEdge edge : allEdges) {
            adjacency.computeIfAbsent(edge.getSource().getId(), k -> new ArrayList<>()).add(edge);
            if (edge.isBidirectional()) {
                adjacency.computeIfAbsent(edge.getTarget().getId(), k -> new ArrayList<>()).add(edge);
            }
        }

        Set<Long> visited = new HashSet<>();
        Set<Long> frontier = new HashSet<>(List.of(root.getId()));
        Set<KnowledgeGraphEdge> usedEdges = new HashSet<>();
        int maxDepth = Math.max(1, Math.min(depth, 3));
        for (int d = 0; d < maxDepth && !frontier.isEmpty(); d++) {
            visited.addAll(frontier);
            Set<Long> next = new HashSet<>();
            for (Long docId : frontier) {
                for (KnowledgeGraphEdge edge : adjacency.getOrDefault(docId, List.of())) {
                    Long other = edge.getSource().getId().equals(docId)
                            ? edge.getTarget().getId() : edge.getSource().getId();
                    if (!visited.contains(other)) {
                        next.add(other);
                        usedEdges.add(edge);
                    } else if (d > 0) {
                        usedEdges.add(edge);
                    }
                }
            }
            frontier = next;
        }
        visited.addAll(frontier);

        List<DocNodeResponse> nodes = documentRepository.findAllById(visited).stream()
                .map(DocNodeResponse::from)
                .toList();
        List<GraphEdgeResponse> edges = usedEdges.stream()
                .map(edge -> new GraphEdgeResponse(edge.getSource().getId(), edge.getTarget().getId(),
                        edge.getRelationType().name(), edge.getWeight()))
                .toList();
        return new DocGraphResponse(nodes, edges, maxDepth);
    }

    @Transactional
    public GraphEdgeResponse createEdge(EdgeRequest request) {
        if (request.sourceId().equals(request.targetId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "sourceId và targetId phải khác nhau");
        }
        RelationType relationType = parseRelationType(request.relationType());
        Document source = documentRepository.findByIdAndDeletedAtIsNull(request.sourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Document", request.sourceId()));
        Document target = documentRepository.findByIdAndDeletedAtIsNull(request.targetId())
                .orElseThrow(() -> new ResourceNotFoundException("Document", request.targetId()));

        KnowledgeGraphEdge edge = KnowledgeGraphEdge.builder()
                .source(source)
                .target(target)
                .relationType(relationType)
                .weight(request.weight() == null ? 1.0 : Math.max(0.0, Math.min(1.0, request.weight())))
                .isBidirectional(request.isBidirectional() == null || request.isBidirectional())
                .build();
        edge = knowledgeGraphRepository.save(edge);
        return new GraphEdgeResponse(edge.getSource().getId(), edge.getTarget().getId(),
                edge.getRelationType().name(), edge.getWeight());
    }

    @Transactional
    public void saveLayout(LayoutRequest request) {
        for (LayoutRequest.NodePosition node : request.nodes()) {
            if (node == null || node.id() == null) {
                continue;
            }
            tagRepository.updateNodePosition(node.id(),
                    Objects.requireNonNullElse(node.x(), 0.0),
                    Objects.requireNonNullElse(node.y(), 0.0),
                    Objects.requireNonNullElse(node.z(), 0.0));
        }
    }

    private void mergeEdges(Map<String, GraphEdgeResponse> merged, List<TagEdgeAggView> views) {
        for (TagEdgeAggView view : views) {
            long a = Math.min(view.getSourceTag(), view.getTargetTag());
            long b = Math.max(view.getSourceTag(), view.getTargetTag());
            String key = a + "-" + b + "-" + view.getRelationType();
            double weight = view.getWeight() == null ? 1.0 : view.getWeight();
            GraphEdgeResponse existing = merged.get(key);
            if (existing == null) {
                merged.put(key, new GraphEdgeResponse(a, b, view.getRelationType(), weight));
            } else {
                merged.put(key, new GraphEdgeResponse(a, b, view.getRelationType(),
                        existing.weight() + weight));
            }
        }
    }

    private RelationType parseRelationType(String value) {
        try {
            return RelationType.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "relationType không hợp lệ (RELATED_TO | PREREQUISITE_OF | PART_OF | SEE_ALSO)");
        }
    }

    /** Phân bố đều các node lên mặt cầu (dùng khi chưa có layout từ d3-force) */
    private double[] fibonacciSphere(int index, int total) {
        if (total <= 1) {
            return new double[]{0, 0, 0};
        }
        double phi = Math.acos(1 - 2 * (index + 0.5) / total);
        double theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
        return new double[]{
                LAYOUT_RADIUS * Math.sin(phi) * Math.cos(theta),
                LAYOUT_RADIUS * Math.sin(phi) * Math.sin(theta),
                LAYOUT_RADIUS * Math.cos(phi)};
    }
}
