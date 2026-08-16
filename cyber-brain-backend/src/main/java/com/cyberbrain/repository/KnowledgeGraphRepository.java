package com.cyberbrain.repository;

import com.cyberbrain.dto.projection.TagEdgeAggView;
import com.cyberbrain.entity.KnowledgeGraphEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface KnowledgeGraphRepository extends JpaRepository<KnowledgeGraphEdge, Long> {

    @Query("SELECT DISTINCT e FROM KnowledgeGraphEdge e LEFT JOIN FETCH e.source LEFT JOIN FETCH e.target")
    List<KnowledgeGraphEdge> findAllWithDocuments();

    // Edge tag-tag do 2 tag cùng xuất hiện trên một document
    @Query(value = """
            SELECT t1.id AS source_tag, t2.id AS target_tag, COUNT(*) AS weight, 'CO_OCCURS' AS relation_type
            FROM tb_doc_tags dt1
            JOIN tb_doc_tags dt2 ON dt1.document_id = dt2.document_id AND dt1.tag_id < dt2.tag_id
            JOIN tb_tags t1 ON t1.id = dt1.tag_id
            JOIN tb_tags t2 ON t2.id = dt2.tag_id
            GROUP BY t1.id, t2.id
            """, nativeQuery = true)
    List<TagEdgeAggView> findCoOccurrenceEdges();

    // Edge tag-tag suy ra từ quan hệ document-document trong knowledge graph
    @Query(value = """
            SELECT ta.id AS source_tag, tb.id AS target_tag, SUM(kg.weight) AS weight,
                   kg.relation_type AS relation_type
            FROM tb_knowledge_graph kg
            JOIN tb_doc_tags dta ON dta.document_id = kg.source_id
            JOIN tb_doc_tags dtb ON dtb.document_id = kg.target_id
            JOIN tb_tags ta ON ta.id = dta.tag_id
            JOIN tb_tags tb ON tb.id = dtb.tag_id
            WHERE ta.id <> tb.id
            GROUP BY ta.id, tb.id, kg.relation_type
            """, nativeQuery = true)
    List<TagEdgeAggView> findDocumentRelationEdges();
}
