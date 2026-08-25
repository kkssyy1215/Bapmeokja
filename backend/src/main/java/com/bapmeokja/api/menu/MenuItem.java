package com.bapmeokja.api.menu;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "menu_items", indexes = @Index(name = "idx_menu_items_category", columnList = "category_id"))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MenuItem {
    @Id
    @Column(length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private MenuCategory category;

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

    @Column(name = "avg_price", nullable = false)
    private int avgPrice;

    public MenuItem(
            String id,
            MenuCategory category,
            String name,
            String imageUrl,
            double calorie,
            double carb,
            double protein,
            double fat,
            int avgPrice
    ) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.imageUrl = imageUrl;
        this.calorie = calorie;
        this.carb = carb;
        this.protein = protein;
        this.fat = fat;
        this.avgPrice = avgPrice;
    }
}
