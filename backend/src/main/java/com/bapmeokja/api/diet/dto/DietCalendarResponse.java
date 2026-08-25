package com.bapmeokja.api.diet.dto;

import java.time.LocalDate;
import java.util.List;

public record DietCalendarResponse(
        int year,
        int month,
        List<LocalDate> recordedDates
) {
}
