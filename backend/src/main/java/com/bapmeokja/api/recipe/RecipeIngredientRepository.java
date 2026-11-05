package com.bapmeokja.api.recipe;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
    List<RecipeIngredient> findByRecipeIdOrderByIdAsc(String recipeId);

    List<RecipeIngredient> findByRecipeIdIn(Collection<String> recipeIds);
}
