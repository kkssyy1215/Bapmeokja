package com.bapmeokja.api.store;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreMenuRepository extends JpaRepository<StoreMenu, Long> {
    @EntityGraph(attributePaths = {"store", "menuItem", "menuItem.category"})
    List<StoreMenu> findAllByStore_IdInAndMenuItem_Category_Id(
            Collection<String> storeIds,
            String categoryId
    );
}
