package com.bapmeokja.api.store.place;

import java.util.List;

/** 외부 지도 서비스에서 현재 위치 주변 식당을 찾는다. 실패하면 빈 목록을 돌려준다. */
public interface PlaceSearch {

    /** 화면에 표시할 출처 이름. 응답의 source 값으로 쓴다. */
    String source();

    List<Place> search(double lat, double lng, int radius, String keyword);

    record Place(String id, String name, String address, double lat, double lng, String category, String placeUrl) {
    }
}
