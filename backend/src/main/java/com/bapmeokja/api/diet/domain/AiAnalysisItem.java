package com.bapmeokja.api.diet.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "ai_analysis_items")
public class AiAnalysisItem {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AiAnalysis analysis;

    @Column(name = "food_id", length = 50)
    private String foodId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "weight_gram", nullable = false, precision = 10, scale = 2)
    private BigDecimal weightGram;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal calorie;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal carb;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal protein;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fat;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sodium;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cholesterol;

    protected AiAnalysisItem() {
    }

    public AiAnalysisItem(
            String id,
            String foodId,
            String name,
            BigDecimal weightGram,
            BigDecimal calorie,
            BigDecimal carb,
            BigDecimal protein,
            BigDecimal fat,
            BigDecimal sodium,
            BigDecimal cholesterol
    ) {
        this.id = id;
        this.foodId = foodId;
        this.name = name;
        this.weightGram = weightGram;
        this.calorie = calorie;
        this.carb = carb;
        this.protein = protein;
        this.fat = fat;
        this.sodium = sodium;
        this.cholesterol = cholesterol;
    }

    void attachTo(AiAnalysis analysis) {
        this.analysis = analysis;
    }

    public String getId() {
        return id;
    }

    public AiAnalysis getAnalysis() {
        return analysis;
    }

    public String getFoodId() {
        return foodId;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getWeightGram() {
        return weightGram;
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
