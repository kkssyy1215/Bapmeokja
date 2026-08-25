package com.bapmeokja.api.diet.repository;

import com.bapmeokja.api.diet.domain.AiAnalysis;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, String> {

    @EntityGraph(attributePaths = "items")
    Optional<AiAnalysis> findWithItemsByIdAndUser_Id(String id, Long userId);
}
