package com.bapmeokja.api.diet.repository;

import com.bapmeokja.api.diet.domain.AiAnalysis;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, String> {

    @EntityGraph(attributePaths = "items")
    Optional<AiAnalysis> findWithItemsByIdAndUser_Id(String id, Long userId);

    @Query("select analysis.imageUrl from AiAnalysis analysis where analysis.user.id = :userId and analysis.imageUrl is not null")
    List<String> findImageUrlsByUserId(@Param("userId") Long userId);
}
