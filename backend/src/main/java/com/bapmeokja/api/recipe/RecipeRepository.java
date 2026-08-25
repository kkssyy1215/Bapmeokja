package com.bapmeokja.api.recipe;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe, String> {
    @EntityGraph(attributePaths = "category")
    List<Recipe> findByCategoryIdOrderByEstimatedCostAsc(String categoryId);

    @EntityGraph(attributePaths = "category")
    List<Recipe> findAllByOrderByEstimatedCostAsc();
}
