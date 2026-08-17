package com.cyberbrain.repository;

import com.cyberbrain.dto.projection.SearchHitView;
import com.cyberbrain.dto.projection.SuggestionView;
import com.cyberbrain.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {

    Optional<Document> findBySlugAndDeletedAtIsNull(String slug);

    Optional<Document> findByIdAndDeletedAtIsNull(Long id);

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"tags", "author"})
    @Override
    Page<Document> findAll(Specification<Document> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"tags"})
    List<Document> findAllByIdIn(java.util.Collection<Long> ids);

    @Modifying
    @Query("UPDATE Document d SET d.viewCount = d.viewCount + 1 WHERE d.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Document d SET d.deletedAt = CURRENT_TIMESTAMP WHERE d.id = :id")
    void softDelete(@Param("id") Long id);

    // Full-text search (PostgreSQL FTS, config 'simple' hỗ trợ tiếng Việt ở mức từ khóa)
    @Query(value = """
            SELECT d.id          AS id,
                   d.title       AS title,
                   d.slug        AS slug,
                   d.summary     AS summary,
                   ts_rank(d.search_vector, websearch_to_tsquery('simple', :q)) AS rank,
                   ts_headline('simple', d.content, websearch_to_tsquery('simple', :q),
                       'StartSel=<mark>,StopSel=</mark>,MaxFragments=2') AS headline
            FROM tb_documents d
            WHERE d.deleted_at IS NULL
              AND d.is_published = true
              AND d.search_vector @@ websearch_to_tsquery('simple', :q)
            ORDER BY rank DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<SearchHitView> search(@Param("q") String q, @Param("limit") int limit);

    @Query(value = """
            SELECT d.id          AS id,
                   d.title       AS title,
                   d.slug        AS slug,
                   d.summary     AS summary,
                   ts_rank(d.search_vector, websearch_to_tsquery('simple', :q)) AS rank,
                   ts_headline('simple', d.content, websearch_to_tsquery('simple', :q),
                       'StartSel=<mark>,StopSel=</mark>,MaxFragments=2') AS headline
            FROM tb_documents d
            WHERE d.deleted_at IS NULL
              AND d.is_published = true
              AND d.search_vector @@ websearch_to_tsquery('simple', :q)
              AND EXISTS (SELECT 1 FROM tb_doc_tags dt
                          JOIN tb_tags t ON t.id = dt.tag_id
                          WHERE dt.document_id = d.id AND t.slug = :tagSlug)
            ORDER BY rank DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<SearchHitView> searchWithTag(@Param("q") String q, @Param("tagSlug") String tagSlug, @Param("limit") int limit);

    @Query(value = """
            SELECT id, title, slug
            FROM tb_documents
            WHERE deleted_at IS NULL
              AND is_published = true
              AND LOWER(title) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY view_count DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<SuggestionView> suggest(@Param("q") String q, @Param("limit") int limit);
}
