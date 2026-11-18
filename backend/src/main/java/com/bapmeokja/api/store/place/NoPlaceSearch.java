package com.bapmeokja.api.store.place;

import java.util.List;

/** 카카오 키가 없을 때 쓴다. 외부 검색 없이 밥먹자 등록 매장만 보여 준다. */
public class NoPlaceSearch implements PlaceSearch {

    @Override
    public String source() {
        return "none";
    }

    @Override
    public List<Place> search(double lat, double lng, int radius, String keyword) {
        return List.of();
    }
}
