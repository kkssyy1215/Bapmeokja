package com.bapmeokja.api.store;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.menu.MenuCategoryRepository;
import com.bapmeokja.api.store.place.MenuKeywords;
import com.bapmeokja.api.store.place.PlaceSearch;
import com.bapmeokja.api.user.domain.User;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** 현재 위치 주변에서 추천 메뉴를 파는 실제 식당을 카카오 지도 검색으로 찾는다. */
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

    private final MenuCategoryRepository menuCategoryRepository;
    private final CurrentUserProvider currentUserProvider;
    private final PlaceSearch placeSearch;
    private final Map<String, CachedPlaces> placeCache = new ConcurrentHashMap<>();

    public StoreDtos.NearbyStoresResponse getNearby(
            double lat,
            double lng,
            String categoryId,
            int radius,
            String keyword
    ) {
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
        Map<String, StoreDtos.NearbyStore> found = new LinkedHashMap<>();
        for (CompletableFuture<List<PlaceSearch.Place>> search : searches) {
            if (found.size() >= ENOUGH_RESULTS) {
                break;
            }
            List<PlaceSearch.Place> places = search.isDone() && !search.isCompletedExceptionally() ? search.join() : List.of();
            for (PlaceSearch.Place place : places) {
                int distance = (int) Math.round(distanceMeters(lat, lng, place.lat(), place.lng()));
                if (distance > radius) {
                    continue;
                }
                found.putIfAbsent(place.id(), new StoreDtos.NearbyStore(
                        place.id(), place.name(), place.address(), place.lat(), place.lng(), distance,
                        List.of(), placeSearch.source(), place.category(), place.placeUrl()
                ));
            }
        }
        List<StoreDtos.NearbyStore> stores = new ArrayList<>(found.values());
        stores.sort(Comparator.comparingInt(StoreDtos.NearbyStore::distance));
        return new StoreDtos.NearbyStoresResponse(stores.stream().limit(MAX_RESULTS).toList());
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

    static double distanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private record CachedPlaces(List<PlaceSearch.Place> places, Instant expiresAt) {
    }
}
