package com.bapmeokja.api.menu;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    @EntityGraph(attributePaths = "category")
    List<MenuItem> findByCategoryIdOrderByAvgPriceAsc(String categoryId);
}
