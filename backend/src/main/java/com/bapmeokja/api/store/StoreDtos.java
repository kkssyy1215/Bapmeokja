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
            List<StoreMenuItem> menus,
            /** partner: 밥먹자 등록 매장, kakao/osm: 지도 서비스에서 찾은 식당 */
            String source,
            String category,
            String placeUrl
    ) {
    }

    public record StoreMenuItem(String name, double calorie, int price) {
    }
}
