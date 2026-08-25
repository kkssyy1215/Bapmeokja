package com.bapmeokja.api.diet.service;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.common.time.AppTime;
import com.bapmeokja.api.diet.domain.AiAnalysis;
import com.bapmeokja.api.diet.domain.DietRecord;
import com.bapmeokja.api.diet.domain.DietRecordItem;
import com.bapmeokja.api.diet.dto.CreateDietRecordRequest;
import com.bapmeokja.api.diet.dto.CreateDietRecordResponse;
import com.bapmeokja.api.diet.dto.CreateManualDietRecordRequest;
import com.bapmeokja.api.diet.dto.DailyDietRecordsResponse;
import com.bapmeokja.api.diet.dto.DailyDietRecordsResponse.RecordSummary;
import com.bapmeokja.api.diet.dto.DietCalendarResponse;
import com.bapmeokja.api.diet.dto.DietRecordDetailResponse;
import com.bapmeokja.api.diet.dto.DietRecordDetailResponse.RecordItem;
import com.bapmeokja.api.diet.dto.NutritionItemRequest;
import com.bapmeokja.api.diet.dto.UpdateDietRecordRequest;
import com.bapmeokja.api.diet.repository.AiAnalysisRepository;
import com.bapmeokja.api.diet.repository.DietRecordRepository;
import com.bapmeokja.api.user.domain.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DietRecordService {

    private final DietRecordRepository dietRecordRepository;
    private final AiAnalysisRepository analysisRepository;
    private final ResourceIdGenerator idGenerator;
    private final DietUserResolver userResolver;

    @Transactional
    public CreateDietRecordResponse create(Long userId, CreateDietRecordRequest request) {
        User user = userResolver.resolve(userId);
        AiAnalysis analysis = resolveAnalysis(request.analyzeId(), user);
        DietRecord record = new DietRecord(
                idGenerator.next("rec_"),
                user,
                analysis == null ? null : analysis.getId(),
                request.mealType(),
                request.eatenAt(),
                analysis == null ? null : analysis.getImageUrl()
        );
        request.items().stream().map(this::toEntity).forEach(record::addItem);
        DietRecord saved = dietRecordRepository.save(record);
        return CreateDietRecordResponse.complete(
                saved.getId(),
                saved.getEatenAt(),
                roundedInt(saved.getTotalCalorie())
        );
    }

    @Transactional
    public CreateDietRecordResponse createManual(Long userId, CreateManualDietRecordRequest request) {
        User user = userResolver.resolve(userId);
        DietRecord record = new DietRecord(
                idGenerator.next("rec_"),
                user,
                null,
                request.mealType(),
                request.eatenAt(),
                null
        );
        request.items().stream().map(this::toEntity).forEach(record::addItem);
        DietRecord saved = dietRecordRepository.save(record);
        return CreateDietRecordResponse.idOnly(saved.getId());
    }

    @Transactional(readOnly = true)
    public DietCalendarResponse calendar(Long userId, int year, int month) {
        validateYearMonth(year, month);
        User user = userResolver.resolve(userId);
        YearMonth yearMonth = YearMonth.of(year, month);
        Instant start = AppTime.startOfDay(yearMonth.atDay(1));
        Instant end = AppTime.startOfDay(yearMonth.plusMonths(1).atDay(1));
        List<LocalDate> dates = dietRecordRepository.findAllWithItemsInPeriod(user.getId(), start, end)
                .stream()
                .map(record -> AppTime.toLocalDate(record.getEatenAt()))
                .distinct()
                .toList();
        return new DietCalendarResponse(year, month, dates);
    }

    @Transactional(readOnly = true)
    public DailyDietRecordsResponse recordsOn(Long userId, LocalDate date) {
        User user = userResolver.resolve(userId);
        List<DietRecord> records = findInPeriod(user, date, date.plusDays(1));
        int totalCalorie = roundedInt(records.stream()
                .map(DietRecord::getTotalCalorie)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return new DailyDietRecordsResponse(
                date,
                totalCalorie,
                records.stream().map(this::toSummary).toList()
        );
    }

    @Transactional(readOnly = true)
    public DietRecordDetailResponse get(Long userId, String recordId) {
        User user = userResolver.resolve(userId);
        return toDetail(findOwned(recordId, user));
    }

    @Transactional
    public CreateDietRecordResponse update(Long userId, String recordId, UpdateDietRecordRequest request) {
        User user = userResolver.resolve(userId);
        DietRecord record = findOwned(recordId, user);
        record.update(request.mealType(), request.eatenAt());
        record.replaceItems(request.items().stream().map(this::toEntity).toList());
        return CreateDietRecordResponse.idOnly(record.getId());
    }

    @Transactional
    public void delete(Long userId, String recordId) {
        User user = userResolver.resolve(userId);
        dietRecordRepository.delete(findOwned(recordId, user));
    }

    private AiAnalysis resolveAnalysis(String analyzeId, User user) {
        if (analyzeId == null || analyzeId.isBlank()) {
            return null;
        }
        return analysisRepository.findWithItemsByIdAndUser_Id(analyzeId, user.getId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "존재하지 않는 분석 결과입니다."
                ));
    }

    private List<DietRecord> findInPeriod(User user, LocalDate startDate, LocalDate endDate) {
        Instant start = AppTime.startOfDay(startDate);
        Instant end = AppTime.startOfDay(endDate);
        return dietRecordRepository.findAllWithItemsInPeriod(user.getId(), start, end);
    }

    private DietRecord findOwned(String recordId, User user) {
        return dietRecordRepository.findOwnedWithItems(recordId, user.getId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "존재하지 않는 식단 기록입니다."
                ));
    }

    private DietRecordItem toEntity(NutritionItemRequest item) {
        String foodId = item.itemId();
        if (foodId == null || foodId.isBlank()) {
            foodId = idGenerator.next("itm_");
        }
        return new DietRecordItem(
                foodId,
                item.name().trim(),
                item.weightGram(),
                item.calorie(),
                item.carb(),
                item.protein(),
                item.fat(),
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
    }

    private RecordSummary toSummary(DietRecord record) {
        return new RecordSummary(
                record.getId(),
                record.getMealType(),
                record.getEatenAt(),
                record.getThumbnailUrl(),
                record.displayFoodName(),
                record.getTotalWeightGram().doubleValue(),
                roundedInt(record.getTotalCalorie()),
                record.getTotalCarb().doubleValue(),
                record.getTotalProtein().doubleValue(),
                record.getTotalFat().doubleValue()
        );
    }

    private DietRecordDetailResponse toDetail(DietRecord record) {
        return new DietRecordDetailResponse(
                record.getId(),
                record.getAnalyzeId(),
                record.getMealType(),
                record.getEatenAt(),
                record.getThumbnailUrl(),
                record.displayFoodName(),
                record.getTotalWeightGram().doubleValue(),
                roundedInt(record.getTotalCalorie()),
                record.getTotalCarb().doubleValue(),
                record.getTotalProtein().doubleValue(),
                record.getTotalFat().doubleValue(),
                record.getItems().stream().map(item -> new RecordItem(
                        item.getFoodId(),
                        item.getName(),
                        item.getWeightGram().doubleValue(),
                        roundedInt(item.getCalorie()),
                        item.getCarb().doubleValue(),
                        item.getProtein().doubleValue(),
                        item.getFat().doubleValue()
                )).toList()
        );
    }

    private int roundedInt(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP).intValue();
    }

    private void validateYearMonth(int year, int month) {
        if (year < 2000 || year > 2100 || month < 1 || month > 12) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "연도와 월의 범위를 확인해주세요.");
        }
    }
}
