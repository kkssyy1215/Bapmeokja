package com.bapmeokja.api.common.time;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
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

    /** 월 단위 API와 같은 범위(2000~2100년)만 받아, DB가 표현할 수 없는 날짜 조회를 입력 오류로 처리한다. */
    public static void requireSupportedDate(LocalDate date) {
        if (date.getYear() < 2000 || date.getYear() > 2100) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "날짜 범위를 확인해주세요.");
        }
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
