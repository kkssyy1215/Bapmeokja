package com.bapmeokja.api.food.repository;

import com.bapmeokja.api.food.domain.Food;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodRepository extends JpaRepository<Food, String> {
    Page<Food> findByNameContainingIgnoreCaseOrderByNameAsc(String keyword, Pageable pageable);
}
