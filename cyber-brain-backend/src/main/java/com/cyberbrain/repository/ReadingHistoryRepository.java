package com.cyberbrain.repository;

import com.cyberbrain.entity.ReadingHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Long> {

    @EntityGraph(attributePaths = {"document", "document.author", "document.tags"})
    Page<ReadingHistory> findByUserIdOrderByReadAtDesc(Long userId, Pageable pageable);
}
