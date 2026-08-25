package com.bapmeokja.api.store;

import com.bapmeokja.api.menu.MenuItem;
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
        name = "store_menus",
        indexes = {
                @Index(name = "idx_store_menus_store", columnList = "store_id"),
                @Index(name = "idx_store_menus_item", columnList = "menu_item_id")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoreMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private double calorie;

    @Column(nullable = false)
    private int price;

    public StoreMenu(Store store, MenuItem menuItem, String name, double calorie, int price) {
        this.store = store;
        this.menuItem = menuItem;
        this.name = name;
        this.calorie = calorie;
        this.price = price;
    }
}
