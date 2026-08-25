package com.bapmeokja.api.recipe;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "recipe_ingredient_alternatives",
        indexes = @Index(name = "idx_recipe_alt_ingredient", columnList = "recipe_ingredient_id")
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecipeIngredientAlternative {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_ingredient_id", nullable = false)
    private RecipeIngredient recipeIngredient;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 300)
    private String reason;

    public RecipeIngredientAlternative(RecipeIngredient recipeIngredient, String name, String reason) {
        this.recipeIngredient = recipeIngredient;
        this.name = name;
        this.reason = reason;
    }
}
