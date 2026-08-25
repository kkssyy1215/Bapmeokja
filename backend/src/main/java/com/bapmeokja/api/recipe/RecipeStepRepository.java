package com.bapmeokja.api.recipe;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeStepRepository extends JpaRepository<RecipeStep, Long> {
    List<RecipeStep> findByRecipeIdOrderByStepNoAsc(String recipeId);
}
