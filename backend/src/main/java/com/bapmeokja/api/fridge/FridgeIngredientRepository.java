package com.bapmeokja.api.fridge;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FridgeIngredientRepository extends JpaRepository<FridgeIngredient, String> {
    @Query("""
            select ingredient
            from FridgeIngredient ingredient
            where ingredient.user.id = :userId
            order by case when ingredient.expiryDate is null then 1 else 0 end,
                     ingredient.expiryDate asc,
                     ingredient.createdAt desc
            """)
    List<FridgeIngredient> findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(@Param("userId") Long userId);

    Optional<FridgeIngredient> findByIdAndUser_Id(String id, Long userId);

    boolean existsByUser_IdAndNameIgnoreCase(Long userId, String name);
}
