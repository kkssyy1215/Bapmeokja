package com.bapmeokja.api.diet.repository;

import com.bapmeokja.api.diet.domain.AiAnalysisItem;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAnalysisItemRepository extends JpaRepository<AiAnalysisItem, String> {

    @EntityGraph(attributePaths = {"analysis", "analysis.user"})
    Optional<AiAnalysisItem> findByIdAndAnalysis_User_Id(String id, Long userId);
}
