package com.bapmeokja.api.store;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.menu.MenuCategoryRepository;
import com.bapmeokja.api.user.domain.User;
import com.bapmeokja.api.store.place.MenuKeywords;
import com.bapmeokja.api.store.place.PlaceSearch;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class NearbyStoreService {
    private static final double EARTH_RADIUS_METERS = 6_371_000.0;
    private static final int MAX_RESULTS = 15;
    private static final int MAX_QUERIES = 5;
    private static final int ENOUGH_RESULTS = 5;
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final Duration SEARCH_BUDGET = Duration.ofSeconds(5);
    private static final ExecutorService SEARCH_POOL = Executors.newFixedThreadPool(8, runnable -> {
        Thread thread = new Thread(runnable, "place-search");
        thread.setDaemon(true);
        return thread;
    });

    private final StoreRepository storeRepository;
    private final StoreMenuRepository storeMenuRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final CurrentUserProvider currentUserProvider;
    private final PlaceSearch placeSearch;
    private final TransactionTemplate transactionTemplate;
    private final Map<String, CachedPlaces> placeCache = new ConcurrentHashMap<>();

    /**
     * 현재 위치 주변에서 추천 메뉴와 맞는 식당을 찾는다.
     * 밥먹자에 등록된 제휴 매장(메뉴와 가격 포함)과 지도 서비스에서 찾은 실제 식당을 거리순으로 합친다.
     */
    public StoreDtos.NearbyStoresResponse getNearby(
            double lat,
            double lng,
            String categoryId,
            int radius,
            String keyword
    ) {
        // 외부 지도 검색은 수 초가 걸릴 수 있어 DB 조회와 분리한다.
        List<StoreDtos.NearbyStore> partners = transactionTemplate.execute(status -> partnerStores(lat, lng, categoryId, radius));
        List<StoreDtos.NearbyStore> merged = new ArrayList<>(partners == null ? List.of() : partners);
        Set<String> partnerNames = merged.stream().map(store -> normalize(store.name())).collect(Collectors.toSet());
        Map<String, StoreDtos.NearbyStore> external = new LinkedHashMap<>();
        // 검색어별 요청을 동시에 보내고, 전체 대기 시간은 SEARCH_BUDGET으로 묶는다. 늦은 결과는 버린다.
        List<String> queries = "none".equals(placeSearch.source()) ? List.of() : MenuKeywords.of(keyword, categoryId);
        List<CompletableFuture<List<PlaceSearch.Place>>> searches = queries.stream()
                .limit(MAX_QUERIES)
                .map(query -> CompletableFuture.supplyAsync(() -> cachedSearch(lat, lng, radius, query), SEARCH_POOL))
                .toList();
        try {
            CompletableFuture.allOf(searches.toArray(CompletableFuture[]::new)).get(SEARCH_BUDGET.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException | ExecutionException exception) {
            // 끝난 검색 결과만 쓴다.
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
        // 메뉴 이름 검색 결과를 먼저 쓰고, 결과가 적을 때만 요리 이름·카테고리 같은 넓은 검색어 결과를 더한다.
        for (CompletableFuture<List<PlaceSearch.Place>> search : searches) {
            if (external.size() >= ENOUGH_RESULTS) {
                break;
            }
            List<PlaceSearch.Place> places = search.isDone() && !search.isCompletedExceptionally() ? search.join() : List.of();
            for (PlaceSearch.Place place : places) {
                int distance = (int) Math.round(distanceMeters(lat, lng, place.lat(), place.lng()));
                if (distance > radius || partnerNames.contains(normalize(place.name()))) {
                    continue;
                }
                external.putIfAbsent(place.id(), new StoreDtos.NearbyStore(
                        place.id(), place.name(), place.address(), place.lat(), place.lng(), distance,
                        List.of(), placeSearch.source(), place.category(), place.placeUrl()
                ));
            }
        }
        merged.addAll(external.values());
        merged.sort(Comparator.comparingInt(StoreDtos.NearbyStore::distance));
        return new StoreDtos.NearbyStoresResponse(merged.stream().limit(MAX_RESULTS).toList());
    }

    private List<StoreDtos.NearbyStore> partnerStores(double lat, double lng, String categoryId, int radius) {
        User user = currentUserProvider.get();
        if (!user.isLocationConsentGranted()) {
            throw new BusinessException(
                    ErrorCode.LOCATION_CONSENT_REQUIRED,
                    "위치 정보 동의가 필요한 기능입니다."
            );
        }
        if (!menuCategoryRepository.existsById(categoryId)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 메뉴 카테고리입니다.");
        }

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

    private List<PlaceSearch.Place> cachedSearch(double lat, double lng, int radius, String query) {
        String key = String.format(Locale.ROOT, "%.3f|%.3f|%d|%s", lat, lng, radius, query);
        Instant now = Instant.now();
        CachedPlaces cached = placeCache.get(key);
        if (cached != null && cached.expiresAt().isAfter(now)) {
            return cached.places();
        }
        List<PlaceSearch.Place> places = placeSearch.search(lat, lng, radius, query);
        if (placeCache.size() > 500) {
            placeCache.clear();
        }
        placeCache.put(key, new CachedPlaces(places, now.plus(CACHE_TTL)));
        return places;
    }

    private static String normalize(String name) {
        return name == null ? "" : name.replaceAll("\\s+", "").toLowerCase(Locale.ROOT);
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
                "partner",
                null,
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

    private record CachedPlaces(List<PlaceSearch.Place> places, Instant expiresAt) {
    }
}
