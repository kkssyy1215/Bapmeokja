package com.bapmeokja.api.store;

import java.util.List;

public final class StoreDtos {
    private StoreDtos() {
    }

    public record NearbyStoresResponse(List<NearbyStore> stores) {
    }

    public record NearbyStore(
            String storeId,
            String name,
            String address,
            double lat,
            double lng,
            int distance,
            List<StoreMenuItem> menus
    ) {
    }

    public record StoreMenuItem(String name, double calorie, int price) {
    }
}
