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
@Table(name = "recipe_steps", indexes = @Index(name = "idx_recipe_steps_order", columnList = "recipe_id,step_no"))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecipeStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "step_no", nullable = false)
    private int stepNo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    public RecipeStep(Recipe recipe, int stepNo, String description) {
        this.recipe = recipe;
        this.stepNo = stepNo;
        this.description = description;
    }
}
