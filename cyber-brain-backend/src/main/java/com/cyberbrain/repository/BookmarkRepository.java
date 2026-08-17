package com.cyberbrain.repository;

import com.cyberbrain.entity.Bookmark;
import com.cyberbrain.entity.BookmarkId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, BookmarkId> {

    Optional<Bookmark> findByIdUserIdAndIdDocumentId(Long userId, Long documentId);

    @EntityGraph(attributePaths = {"document", "document.author", "document.tags"})
    Page<Bookmark> findByIdUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
