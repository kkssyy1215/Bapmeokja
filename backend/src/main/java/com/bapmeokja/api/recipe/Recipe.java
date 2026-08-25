package com.bapmeokja.api.recipe;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
@Table(name = "recipes", indexes = @Index(name = "idx_recipes_category_cost", columnList = "category_id,estimated_cost"))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recipe {
    @Id
    @Column(length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private RecipeCategory category;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private double calorie;

    @Column(nullable = false)
    private double carb;

    @Column(nullable = false)
    private double protein;

    @Column(nullable = false)
    private double fat;

    @Column(name = "cooking_time_minutes", nullable = false)
    private int cookingTimeMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "estimated_cost", nullable = false)
    private int estimatedCost;

    public Recipe(
            String id,
            RecipeCategory category,
            String name,
            String imageUrl,
            double calorie,
            double carb,
            double protein,
            double fat,
            int cookingTimeMinutes,
            Difficulty difficulty,
            int estimatedCost
    ) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.imageUrl = imageUrl;
        this.calorie = calorie;
        this.carb = carb;
        this.protein = protein;
        this.fat = fat;
        this.cookingTimeMinutes = cookingTimeMinutes;
        this.difficulty = difficulty;
        this.estimatedCost = estimatedCost;
    }
}
