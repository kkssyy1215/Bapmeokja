package com.bapmeokja.api.store;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.menu.MenuCategoryRepository;
import com.bapmeokja.api.user.domain.User;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NearbyStoreService {
    private static final double EARTH_RADIUS_METERS = 6_371_000.0;

    private final StoreRepository storeRepository;
    private final StoreMenuRepository storeMenuRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final CurrentUserProvider currentUserProvider;
    private final KakaoLocalClient kakaoLocalClient;

    public StoreDtos.NearbyStoresResponse getNearby(
            double lat,
            double lng,
            String categoryId,
            int radius
    ) {
        User user = currentUserProvider.get();
        if (!user.isLocationConsentGranted()) {
            throw new BusinessException(
                    ErrorCode.LOCATION_CONSENT_REQUIRED,
                    "위치 정보 동의가 필요한 기능입니다."
            );
        }
        String categoryName = menuCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 메뉴 카테고리입니다."))
                .getName();

        // 밥먹자에 등록된 매장(메뉴별 칼로리·가격 있음)과 카카오에서 찾은 실제 주변 음식점을 거리순으로 합친다.
        List<StoreDtos.NearbyStore> registered = registeredStores(lat, lng, categoryId, radius);
        Set<String> registeredNames = registered.stream().map(StoreDtos.NearbyStore::name).collect(Collectors.toSet());
        List<StoreDtos.NearbyStore> kakaoStores = kakaoLocalClient.searchRestaurants(categoryName, lat, lng, radius).stream()
                .filter(place -> place.distance() <= radius)
                .filter(place -> !registeredNames.contains(place.name()))
                .map(place -> new StoreDtos.NearbyStore(
                        "kakao_" + place.id(),
                        place.name(),
                        place.address(),
                        place.lat(),
                        place.lng(),
                        place.distance(),
                        List.of(),
                        place.placeUrl()
                ))
                .toList();

        List<StoreDtos.NearbyStore> stores = Stream.concat(registered.stream(), kakaoStores.stream())
                .sorted(Comparator.comparingInt(StoreDtos.NearbyStore::distance))
                .toList();
        return new StoreDtos.NearbyStoresResponse(stores);
    }

    private List<StoreDtos.NearbyStore> registeredStores(double lat, double lng, String categoryId, int radius) {
        List<StoreDistance> candidates = storeRepository.findAll().stream()
                .map(store -> new StoreDistance(store, distanceMeters(lat, lng, store.getLat(), store.getLng())))
                .filter(item -> item.distance() <= radius)
                .sorted(Comparator.comparingDouble(StoreDistance::distance))
                .toList();
        if (candidates.isEmpty()) {
            return List.of();
        }

        List<String> storeIds = candidates.stream().map(item -> item.store().getId()).toList();
        Map<String, List<StoreMenu>> menusByStore = storeMenuRepository
                .findAllByStore_IdInAndMenuItem_Category_Id(storeIds, categoryId)
                .stream()
                .collect(Collectors.groupingBy(menu -> menu.getStore().getId()));

        return candidates.stream()
                .filter(candidate -> menusByStore.containsKey(candidate.store().getId()))
                .map(candidate -> toResponse(candidate, menusByStore.get(candidate.store().getId())))
                .toList();
    }

    private StoreDtos.NearbyStore toResponse(StoreDistance candidate, List<StoreMenu> menus) {
        Store store = candidate.store();
        return new StoreDtos.NearbyStore(
                store.getId(),
                store.getName(),
                store.getAddress(),
                store.getLat(),
                store.getLng(),
                (int) Math.round(candidate.distance()),
                menus.stream()
                        .map(menu -> new StoreDtos.StoreMenuItem(
                                menu.getName(),
                                menu.getCalorie(),
                                menu.getPrice()
                        ))
                        .toList(),
                null
        );
    }

    static double distanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private record StoreDistance(Store store, double distance) {
    }
}
