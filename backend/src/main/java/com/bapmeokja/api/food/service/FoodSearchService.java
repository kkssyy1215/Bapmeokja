package com.bapmeokja.api.food.service;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.food.domain.Food;
import com.bapmeokja.api.food.dto.FoodSearchResponse;
import com.bapmeokja.api.food.dto.FoodSearchResponse.FoodSummary;
import com.bapmeokja.api.food.repository.FoodRepository;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FoodSearchService {

    private final FoodRepository foodRepository;

    @Transactional(readOnly = true)
    public FoodSearchResponse search(String keyword, int page, int size) {
        if (keyword == null || keyword.isBlank()) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_MISSING, "검색할 음식명을 입력해주세요.");
        }
        if (page < 0 || size < 1 || size > 50) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "page는 0 이상, size는 1~50이어야 합니다.");
        }

        Page<Food> result = foodRepository.findByNameContainingIgnoreCaseOrderByNameAsc(
                keyword.trim(),
                PageRequest.of(page, size, Sort.by("name").ascending())
        );
        return new FoodSearchResponse(
                result.stream().map(this::toSummary).toList(),
                result.getTotalElements(),
                result.getNumber(),
                result.getSize(),
                result.hasNext()
        );
    }

    private FoodSummary toSummary(Food food) {
        return new FoodSummary(
                food.getId(),
                food.getName(),
                food.getBaseWeightGram().doubleValue(),
                food.getCalorie().setScale(0, RoundingMode.HALF_UP).intValue(),
                food.getCarb().doubleValue(),
                food.getProtein().doubleValue(),
                food.getFat().doubleValue()
        );
    }
}
