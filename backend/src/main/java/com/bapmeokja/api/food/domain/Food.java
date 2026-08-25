package com.bapmeokja.api.food.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "foods")
public class Food {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "base_weight_gram", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseWeightGram;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal calorie;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal carb;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal protein;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fat;

    @Column(precision = 10, scale = 2)
    private BigDecimal sodium;

    @Column(precision = 10, scale = 2)
    private BigDecimal cholesterol;

    protected Food() {
    }

    public Food(
            String id,
            String name,
            BigDecimal baseWeightGram,
            BigDecimal calorie,
            BigDecimal carb,
            BigDecimal protein,
            BigDecimal fat,
            BigDecimal sodium,
            BigDecimal cholesterol
    ) {
        this.id = id;
        this.name = name;
        this.baseWeightGram = baseWeightGram;
        this.calorie = calorie;
        this.carb = carb;
        this.protein = protein;
        this.fat = fat;
        this.sodium = sodium;
        this.cholesterol = cholesterol;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getBaseWeightGram() {
        return baseWeightGram;
    }

    public BigDecimal getCalorie() {
        return calorie;
    }

    public BigDecimal getCarb() {
        return carb;
    }

    public BigDecimal getProtein() {
        return protein;
    }

    public BigDecimal getFat() {
        return fat;
    }

    public BigDecimal getSodium() {
        return sodium;
    }

    public BigDecimal getCholesterol() {
        return cholesterol;
    }
}
