package com.bapmeokja.api.common.time;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 식단의 '하루' 경계를 정의한다. 저장 시각은 UTC Instant를 유지하고,
 * 사용자에게 보이는 날짜 계산만 서비스 기본 시간대(한국)로 변환한다.
 */
public final class AppTime {

    public static final ZoneId ZONE_ID = ZoneId.of("Asia/Seoul");

    private AppTime() {
    }

    public static LocalDate today() {
        return LocalDate.now(ZONE_ID);
    }

    public static Instant startOfDay(LocalDate date) {
        return date.atStartOfDay(ZONE_ID).toInstant();
    }

    public static LocalDate toLocalDate(Instant instant) {
        return instant.atZone(ZONE_ID).toLocalDate();
    }
}
