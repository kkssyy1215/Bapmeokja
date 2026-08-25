package com.bapmeokja.api.diet.controller;

import com.bapmeokja.api.common.response.ApiResponse;
import com.bapmeokja.api.diet.dto.CreateDietRecordRequest;
import com.bapmeokja.api.diet.dto.CreateDietRecordResponse;
import com.bapmeokja.api.diet.dto.CreateManualDietRecordRequest;
import com.bapmeokja.api.diet.dto.DailyDietRecordsResponse;
import com.bapmeokja.api.diet.dto.DietCalendarResponse;
import com.bapmeokja.api.diet.dto.DietRecordDetailResponse;
import com.bapmeokja.api.diet.dto.UpdateDietRecordRequest;
import com.bapmeokja.api.diet.service.DietRecordService;
import com.bapmeokja.api.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;

@Tag(name = "식단 기록")
@RestController
@RequestMapping("/v1/diet")
@RequiredArgsConstructor
public class DietRecordController {

    private final DietRecordService dietRecordService;

    @Operation(summary = "분석 결과 기반 식단 등록")
    @PostMapping("/records")
    public ResponseEntity<ApiResponse<CreateDietRecordResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateDietRecordRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                dietRecordService.create(principal.id(), request),
                "식단이 등록되었습니다."
        ));
    }

    @Operation(summary = "수동 식단 등록")
    @PostMapping("/records/manual")
    public ResponseEntity<ApiResponse<CreateDietRecordResponse>> createManual(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateManualDietRecordRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                dietRecordService.createManual(principal.id(), request),
                "식단이 등록되었습니다."
        ));
    }

    @Operation(summary = "월간 식단 캘린더 조회")
    @GetMapping("/calendar")
    public ApiResponse<DietCalendarResponse> calendar(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ApiResponse.success(dietRecordService.calendar(principal.id(), year, month), "조회 성공");
    }

    @Operation(summary = "날짜별 식단 조회")
    @GetMapping("/records")
    public ApiResponse<DailyDietRecordsResponse> records(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.success(dietRecordService.recordsOn(principal.id(), date), "조회 성공");
    }

    @Operation(summary = "식단 단건 조회")
    @GetMapping("/records/{recordId}")
    public ApiResponse<DietRecordDetailResponse> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String recordId
    ) {
        return ApiResponse.success(dietRecordService.get(principal.id(), recordId), "조회 성공");
    }

    @Operation(summary = "식단 수정")
    @PutMapping("/records/{recordId}")
    public ApiResponse<CreateDietRecordResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String recordId,
            @Valid @RequestBody UpdateDietRecordRequest request
    ) {
        return ApiResponse.success(
                dietRecordService.update(principal.id(), recordId, request),
                "식단이 수정되었습니다."
        );
    }

    @Operation(summary = "식단 삭제")
    @DeleteMapping("/records/{recordId}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String recordId
    ) {
        dietRecordService.delete(principal.id(), recordId);
        return ApiResponse.successMessage("식단이 삭제되었습니다.");
    }
}
