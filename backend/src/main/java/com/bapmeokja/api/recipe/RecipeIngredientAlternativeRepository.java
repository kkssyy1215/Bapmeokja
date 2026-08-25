package com.bapmeokja.api.recipe;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeIngredientAlternativeRepository extends JpaRepository<RecipeIngredientAlternative, Long> {
    List<RecipeIngredientAlternative> findByRecipeIngredientIdOrderByIdAsc(Long recipeIngredientId);

    List<RecipeIngredientAlternative> findAllByRecipeIngredient_IdIn(Collection<Long> recipeIngredientIds);
}
