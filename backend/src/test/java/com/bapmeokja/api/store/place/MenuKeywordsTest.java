package com.bapmeokja.api.store.place;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MenuKeywordsTest {

    @Test
    void startsWithTheMenuNameThenItsDishWordThenTheCategory() {
        assertThat(MenuKeywords.of("제육덮밥", "cat_003"))
                .startsWith("제육덮밥", "덮밥", "제육")
                .contains("한식");
    }

    @Test
    void genericNameFallsBackToCategoryWords() {
        assertThat(MenuKeywords.of("맛집", "cat_007")).containsExactly("일식", "초밥", "돈까스");
        assertThat(MenuKeywords.of(null, "unknown")).containsExactly("식당");
    }
}
