package com.bapmeokja.api.diet.domain;

import com.bapmeokja.api.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "diet_records")
public class DietRecord {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "analyze_id", length = 50)
    private String analyzeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;

    @Column(name = "eaten_at", nullable = false)
    private Instant eatenAt;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "total_weight_gram", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalWeightGram = BigDecimal.ZERO;

    @Column(name = "total_calorie", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCalorie = BigDecimal.ZERO;

    @Column(name = "total_carb", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCarb = BigDecimal.ZERO;

    @Column(name = "total_protein", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalProtein = BigDecimal.ZERO;

    @Column(name = "total_fat", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFat = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "dietRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<DietRecordItem> items = new ArrayList<>();

    protected DietRecord() {
    }

    public DietRecord(
            String id,
            User user,
            String analyzeId,
            MealType mealType,
            Instant eatenAt,
            String thumbnailUrl
    ) {
        this.id = id;
        this.user = user;
        this.analyzeId = analyzeId;
        this.mealType = mealType;
        this.eatenAt = eatenAt;
        this.thumbnailUrl = thumbnailUrl;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void addItem(DietRecordItem item) {
        items.add(item);
        item.attachTo(this);
        recalculateTotals();
    }

    public void replaceItems(List<DietRecordItem> replacements) {
        items.clear();
        replacements.forEach(this::addItem);
        recalculateTotals();
    }

    public void update(MealType mealType, Instant eatenAt) {
        this.mealType = mealType;
        this.eatenAt = eatenAt;
    }

    private void recalculateTotals() {
        totalWeightGram = sum(items.stream().map(DietRecordItem::getWeightGram).toList());
        totalCalorie = sum(items.stream().map(DietRecordItem::getCalorie).toList());
        totalCarb = sum(items.stream().map(DietRecordItem::getCarb).toList());
        totalProtein = sum(items.stream().map(DietRecordItem::getProtein).toList());
        totalFat = sum(items.stream().map(DietRecordItem::getFat).toList());
    }

    private BigDecimal sum(List<BigDecimal> values) {
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public String displayFoodName() {
        if (items.isEmpty()) {
            return "식단";
        }
        if (items.size() == 1) {
            return items.get(0).getName();
        }
        return items.get(0).getName() + " 외 " + (items.size() - 1) + "개";
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getAnalyzeId() {
        return analyzeId;
    }

    public MealType getMealType() {
        return mealType;
    }

    public Instant getEatenAt() {
        return eatenAt;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public BigDecimal getTotalWeightGram() {
        return totalWeightGram;
    }

    public BigDecimal getTotalCalorie() {
        return totalCalorie;
    }

    public BigDecimal getTotalCarb() {
        return totalCarb;
    }

    public BigDecimal getTotalProtein() {
        return totalProtein;
    }

    public BigDecimal getTotalFat() {
        return totalFat;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<DietRecordItem> getItems() {
        return items;
    }
}
