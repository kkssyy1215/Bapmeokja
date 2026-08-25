package com.bapmeokja.api.menu;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemIngredientRepository extends JpaRepository<MenuItemIngredient, Long> {
    List<MenuItemIngredient> findByMenuItemIdOrderByIdAsc(String menuItemId);
}
