package com.bapmeokja.api.diet.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CreateDietRecordResponse(
        String recordId,
        Instant eatenAt,
        Integer totalCalorie
) {
    public static CreateDietRecordResponse complete(String recordId, Instant eatenAt, int totalCalorie) {
        return new CreateDietRecordResponse(recordId, eatenAt, totalCalorie);
    }

    public static CreateDietRecordResponse idOnly(String recordId) {
        return new CreateDietRecordResponse(recordId, null, null);
    }
}
