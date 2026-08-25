package com.bapmeokja.api.recipe;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "recipe_categories")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecipeCategory {
    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    public RecipeCategory(String id, String name, String imageUrl) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
    }
}
