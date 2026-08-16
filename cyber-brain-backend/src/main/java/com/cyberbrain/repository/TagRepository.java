package com.cyberbrain.repository;

import com.cyberbrain.dto.projection.TagWithCountView;
import com.cyberbrain.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    @Query(value = """
            SELECT t.id, t.name, t.slug, t.color, t.icon, t.parent_id, t.node_x, t.node_y, t.node_z,
                   COUNT(dt.document_id) AS doc_count
            FROM tb_tags t
            LEFT JOIN tb_doc_tags dt ON dt.tag_id = t.id
            GROUP BY t.id
            ORDER BY doc_count DESC, t.name ASC
            """, nativeQuery = true)
    List<TagWithCountView> findAllWithCount();

    @Modifying
    @Query("UPDATE Tag t SET t.nodeX = :x, t.nodeY = :y, t.nodeZ = :z WHERE t.id = :id")
    void updateNodePosition(@Param("id") Long id, @Param("x") Double x, @Param("y") Double y, @Param("z") Double z);
}
