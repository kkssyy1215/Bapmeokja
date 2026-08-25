package com.bapmeokja.api.diet.domain;

import com.bapmeokja.api.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_analyses")
public class AiAnalysis {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "food_name", nullable = false, length = 200)
    private String foodName;

    @Column(name = "total_calorie", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCalorie;

    @Column(name = "total_carb", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCarb;

    @Column(name = "total_protein", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalProtein;

    @Column(name = "total_fat", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFat;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<AiAnalysisItem> items = new ArrayList<>();

    protected AiAnalysis() {
    }

    public AiAnalysis(String id, User user, String imageUrl, String foodName) {
        this.id = id;
        this.user = user;
        this.imageUrl = imageUrl;
        this.foodName = foodName;
        this.totalCalorie = BigDecimal.ZERO;
        this.totalCarb = BigDecimal.ZERO;
        this.totalProtein = BigDecimal.ZERO;
        this.totalFat = BigDecimal.ZERO;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void addItem(AiAnalysisItem item) {
        items.add(item);
        item.attachTo(this);
        recalculateTotals();
    }

    private void recalculateTotals() {
        totalCalorie = sum(items.stream().map(AiAnalysisItem::getCalorie).toList());
        totalCarb = sum(items.stream().map(AiAnalysisItem::getCarb).toList());
        totalProtein = sum(items.stream().map(AiAnalysisItem::getProtein).toList());
        totalFat = sum(items.stream().map(AiAnalysisItem::getFat).toList());
    }

    private BigDecimal sum(List<BigDecimal> values) {
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getFoodName() {
        return foodName;
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

    public List<AiAnalysisItem> getItems() {
        return items;
    }
}
