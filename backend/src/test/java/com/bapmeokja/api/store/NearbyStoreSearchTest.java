package com.bapmeokja.api.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.menu.MenuCategoryRepository;
import com.bapmeokja.api.store.place.PlaceSearch;
import com.bapmeokja.api.user.domain.User;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class NearbyStoreSearchTest {

    private static final double LAT = 37.5665;
    private static final double LNG = 126.9780;

    private final PlaceSearch placeSearch = mock(PlaceSearch.class);
    private final User user = mock(User.class);
    private NearbyStoreService service;

    @BeforeEach
    void setUp() {
        CurrentUserProvider currentUserProvider = mock(CurrentUserProvider.class);
        when(currentUserProvider.get()).thenReturn(user);
        when(user.isLocationConsentGranted()).thenReturn(true);
        MenuCategoryRepository categoryRepository = mock(MenuCategoryRepository.class);
        when(categoryRepository.existsById("cat_003")).thenReturn(true);
        when(placeSearch.source()).thenReturn("kakao");
        service = new NearbyStoreService(categoryRepository, currentUserProvider, placeSearch);
    }

    @Test
    void showsRealRestaurantsAroundTheCurrentLocationNearestFirst() {
        when(placeSearch.search(anyDouble(), anyDouble(), anyInt(), anyString())).thenReturn(List.of());
        when(placeSearch.search(LAT, LNG, 1500, "제육덮밥")).thenReturn(List.of(
                place("a", "먼 식당", 37.5750, 126.9780),
                place("b", "가까운 식당", 37.5670, 126.9780),
                place("c", "반경 밖 식당", 37.6000, 126.9780)
        ));

        List<StoreDtos.NearbyStore> stores = service.getNearby(LAT, LNG, "cat_003", 1500, "제육덮밥").stores();

        assertThat(stores).extracting(StoreDtos.NearbyStore::name).containsExactly("가까운 식당", "먼 식당");
        assertThat(stores.get(0).source()).isEqualTo("kakao");
        assertThat(stores.get(0).menus()).isEmpty();
    }

    @Test
    void broaderKeywordsAreUsedOnlyWhenTheMenuNameFindsTooFew() {
        when(placeSearch.search(anyDouble(), anyDouble(), anyInt(), anyString())).thenReturn(List.of());
        when(placeSearch.search(LAT, LNG, 1500, "제육덮밥")).thenReturn(List.of(
                place("a", "제육1", 37.5670, 126.9780), place("b", "제육2", 37.5671, 126.9780),
                place("c", "제육3", 37.5672, 126.9780), place("d", "제육4", 37.5673, 126.9780),
                place("e", "제육5", 37.5674, 126.9780)
        ));
        when(placeSearch.search(LAT, LNG, 1500, "한식")).thenReturn(List.of(place("z", "아주 가까운 한식집", 37.5666, 126.9780)));

        List<StoreDtos.NearbyStore> stores = service.getNearby(LAT, LNG, "cat_003", 1500, "제육덮밥").stores();

        assertThat(stores).extracting(StoreDtos.NearbyStore::name).containsExactly("제육1", "제육2", "제육3", "제육4", "제육5");
    }

    @Test
    void repeatedSearchForTheSamePlaceIsServedFromCache() {
        when(placeSearch.search(anyDouble(), anyDouble(), anyInt(), anyString())).thenReturn(List.of(
                place("a", "식당", 37.5670, 126.9780)
        ));

        service.getNearby(LAT, LNG, "cat_003", 1500, "제육덮밥");
        service.getNearby(LAT, LNG, "cat_003", 1500, "제육덮밥");

        verify(placeSearch, times(1)).search(LAT, LNG, 1500, "제육덮밥");
    }

    @Test
    void withoutLocationConsentNothingIsSearched() {
        when(user.isLocationConsentGranted()).thenReturn(false);

        assertThatThrownBy(() -> service.getNearby(LAT, LNG, "cat_003", 1500, "제육덮밥"))
                .isInstanceOf(BusinessException.class);
        verify(placeSearch, never()).search(anyDouble(), anyDouble(), anyInt(), anyString());
    }

    private static PlaceSearch.Place place(String id, String name, double lat, double lng) {
        return new PlaceSearch.Place(id, name, "서울 중구", lat, lng, "한식", null);
    }
}
