package com.bapmeokja.api.menu;

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
@Table(name = "menu_item_ingredients", indexes = @Index(name = "idx_menu_item_ing_item", columnList = "menu_item_id"))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MenuItemIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "weight_gram", nullable = false)
    private double weightGram;

    public MenuItemIngredient(MenuItem menuItem, String name, double weightGram) {
        this.menuItem = menuItem;
        this.name = name;
        this.weightGram = weightGram;
    }
}
