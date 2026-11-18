package com.bapmeokja.api.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.menu.MenuCategory;
import com.bapmeokja.api.menu.MenuCategoryRepository;
import com.bapmeokja.api.store.KakaoLocalClient.KakaoPlace;
import com.bapmeokja.api.user.domain.User;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class NearbyStoreServiceKakaoTest {
    private static final double LAT = 37.4979;
    private static final double LNG = 127.0276;

    private StoreRepository storeRepository;
    private StoreMenuRepository storeMenuRepository;
    private KakaoLocalClient kakaoLocalClient;
    private NearbyStoreService service;

    @BeforeEach
    void setUp() {
        storeRepository = mock(StoreRepository.class);
        storeMenuRepository = mock(StoreMenuRepository.class);
        MenuCategoryRepository categoryRepository = mock(MenuCategoryRepository.class);
        CurrentUserProvider currentUserProvider = mock(CurrentUserProvider.class);
        kakaoLocalClient = mock(KakaoLocalClient.class);
        service = new NearbyStoreService(storeRepository, storeMenuRepository, categoryRepository, currentUserProvider,
                kakaoLocalClient);

        User user = mock(User.class);
        when(user.isLocationConsentGranted()).thenReturn(true);
        when(currentUserProvider.get()).thenReturn(user);
        when(categoryRepository.findById("cat_001")).thenReturn(Optional.of(new MenuCategory("cat_001", "포케", null)));
    }

    @Test
    void addsKakaoRestaurantsToRegisteredStoresByDistance() {
        Store registered = new Store("store_001", "밸런스 포케 강남점", "서울 강남구 강남대로 438", 37.4987, 127.0274);
        StoreMenu menu = mock(StoreMenu.class);
        when(menu.getStore()).thenReturn(registered);
        when(menu.getName()).thenReturn("닭가슴살 현미 포케");
        when(menu.getCalorie()).thenReturn(520.0);
        when(menu.getPrice()).thenReturn(10_900);
        when(storeRepository.findAll()).thenReturn(List.of(registered));
        when(storeMenuRepository.findAllByStore_IdInAndMenuItem_Category_Id(anyList(), eq("cat_001")))
                .thenReturn(List.of(menu));
        when(kakaoLocalClient.searchRestaurants("포케", LAT, LNG, 1500)).thenReturn(List.of(
                new KakaoPlace("1", "포케올데이", "서울 강남구 1", 37.4980, 127.0277, 20, "http://place.map.kakao.com/1"),
                new KakaoPlace("2", "밸런스 포케 강남점", "서울 강남구 강남대로 438", 37.4987, 127.0274, 91, null),
                new KakaoPlace("3", "포케 저멀리", "서울 강남구 3", 37.51, 127.04, 1800, null)));

        List<StoreDtos.NearbyStore> stores = service.getNearby(LAT, LNG, "cat_001", 1500).stores();

        assertThat(stores).extracting(StoreDtos.NearbyStore::storeId).containsExactly("kakao_1", "store_001");
        assertThat(stores.get(0).menus()).isEmpty();
        assertThat(stores.get(0).placeUrl()).isEqualTo("http://place.map.kakao.com/1");
        assertThat(stores.get(1).menus()).extracting(StoreDtos.StoreMenuItem::name).containsExactly("닭가슴살 현미 포케");
    }

    @Test
    void returnsKakaoRestaurantsWhenNoStoreIsRegisteredNearby() {
        when(storeRepository.findAll()).thenReturn(List.of());
        when(kakaoLocalClient.searchRestaurants("포케", 37.5665, 126.978, 1500)).thenReturn(List.of(
                new KakaoPlace("9", "시청 포케", "서울 중구 9", 37.5667, 126.9781, 30, null)));

        assertThat(service.getNearby(37.5665, 126.978, "cat_001", 1500).stores())
                .extracting(StoreDtos.NearbyStore::name)
                .containsExactly("시청 포케");
    }
}
