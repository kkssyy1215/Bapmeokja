package com.bapmeokja.api.store.place;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** 추천 메뉴 이름과 카테고리에서 식당 검색어를 만든다. 앞에 올수록 구체적인 검색어다. */
public final class MenuKeywords {

    private static final List<String> DISH_WORDS = List.of(
            "쌀국수", "칼국수", "잔치국수", "냉면", "국수", "우동", "라멘", "소바", "짬뽕", "짜장", "팟타이",
            "김밥", "떡볶이", "덮밥", "국밥", "비빔밥", "볶음밥", "주먹밥", "초밥", "회덮밥", "규동", "가츠동",
            "돈까스", "찌개", "갈비탕", "곰탕", "설렁탕", "백반", "포케", "샐러드", "샌드위치", "토스트",
            "파스타", "피자", "버거", "치킨", "삼겹살", "갈비", "불고기", "제육", "죽", "만두"
    );

    private static final Map<String, List<String>> CATEGORY_WORDS = Map.ofEntries(
            Map.entry("cat_001", List.of("포케", "샐러드")),
            Map.entry("cat_002", List.of("샌드위치", "토스트")),
            Map.entry("cat_003", List.of("한식", "백반", "국밥")),
            Map.entry("cat_004", List.of("샐러드")),
            Map.entry("cat_005", List.of("김밥", "도시락")),
            Map.entry("cat_006", List.of("국수", "칼국수", "냉면")),
            Map.entry("cat_007", List.of("일식", "초밥", "돈까스")),
            Map.entry("cat_008", List.of("중국집", "짜장")),
            Map.entry("cat_009", List.of("파스타", "피자", "버거")),
            Map.entry("cat_010", List.of("분식", "떡볶이", "김밥")),
            Map.entry("cat_011", List.of("고기", "갈비", "삼겹살")),
            Map.entry("cat_012", List.of("샐러드", "포케"))
    );

    private MenuKeywords() {
    }

    public static List<String> of(String menuName, String categoryId) {
        Set<String> words = new LinkedHashSet<>();
        String name = menuName == null ? "" : menuName.replaceAll("\\s+", "");
        if (!name.isBlank() && !"맛집".equals(name)) {
            words.add(menuName.trim());
            DISH_WORDS.stream().filter(name::contains).forEach(words::add);
        }
        words.addAll(CATEGORY_WORDS.getOrDefault(categoryId, List.of("식당")));
        return List.copyOf(words);
    }
}
