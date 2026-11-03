package com.bapmeokja.api.diet.service;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.diet.domain.AiAnalysis;
import com.bapmeokja.api.diet.domain.AiAnalysisItem;
import com.bapmeokja.api.diet.dto.AnalyzeDietResponse;
import com.bapmeokja.api.diet.dto.AnalyzeDietResponse.AnalyzedItem;
import com.bapmeokja.api.diet.dto.FoodItemDetailResponse;
import com.bapmeokja.api.diet.dto.FoodItemDetailResponse.Ingredient;
import com.bapmeokja.api.diet.repository.AiAnalysisItemRepository;
import com.bapmeokja.api.diet.repository.AiAnalysisRepository;
import com.bapmeokja.api.diet.service.FoodImageAnalyzer.DetectedFood;
import com.bapmeokja.api.diet.service.FoodImageAnalyzer.ImageAnalysisResult;
import com.bapmeokja.api.user.domain.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class DietAnalysisService {

    private final AiAnalysisRepository analysisRepository;
    private final AiAnalysisItemRepository analysisItemRepository;
    private final FoodImageAnalyzer imageAnalyzer;
    private final DietImageStorage imageStorage;
    private final ResourceIdGenerator idGenerator;
    private final DietUserResolver userResolver;
    private final TransactionTemplate transactionTemplate;

    public AnalyzeDietResponse analyze(Long userId, MultipartFile image) {
        String imageUrl = imageStorage.store(image);
        // 외부 AI 호출은 수십 초 걸릴 수 있으므로 DB 커넥션을 잡지 않도록 트랜잭션 밖에서 실행한다.
        ImageAnalysisResult result = imageAnalyzer.analyze(image);
        if (result.items() == null || result.items().isEmpty()) {
            throw new BusinessException(ErrorCode.AI_ANALYSIS_FAILED);
        }
        return transactionTemplate.execute(status -> save(userId, imageUrl, result));
    }

    private AnalyzeDietResponse save(Long userId, String imageUrl, ImageAnalysisResult result) {
        User user = userResolver.resolve(userId);
        AiAnalysis analysis = new AiAnalysis(
                idGenerator.next("anl_"),
                user,
                imageUrl,
                result.foodName()
        );
        for (DetectedFood item : result.items()) {
            analysis.addItem(new AiAnalysisItem(
                    idGenerator.next("itm_"),
                    item.foodId(),
                    item.name(),
                    item.weightGram(),
                    item.calorie(),
                    item.carb(),
                    item.protein(),
                    item.fat(),
                    item.sodium(),
                    item.cholesterol()
            ));
        }
        return toResponse(analysisRepository.save(analysis));
    }

    @Transactional(readOnly = true)
    public FoodItemDetailResponse getItem(Long userId, String itemId) {
        User user = userResolver.resolve(userId);
        AiAnalysisItem item = analysisItemRepository.findByIdAndAnalysis_User_Id(itemId, user.getId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "존재하지 않는 음식 항목입니다."
                ));
        return new FoodItemDetailResponse(
                item.getId(),
                item.getName(),
                item.getWeightGram().doubleValue(),
                roundedInt(item.getCalorie()),
                item.getCarb().doubleValue(),
                item.getProtein().doubleValue(),
                item.getFat().doubleValue(),
                item.getSodium().doubleValue(),
                item.getCholesterol().doubleValue(),
                java.util.List.of(new Ingredient(item.getName(), item.getWeightGram().doubleValue()))
        );
    }

    private AnalyzeDietResponse toResponse(AiAnalysis analysis) {
        return new AnalyzeDietResponse(
                analysis.getId(),
                analysis.getFoodName(),
                roundedInt(analysis.getTotalCalorie()),
                analysis.getTotalCarb().doubleValue(),
                analysis.getTotalProtein().doubleValue(),
                analysis.getTotalFat().doubleValue(),
                analysis.getItems().stream().map(this::toAnalyzedItem).toList()
        );
    }

    private AnalyzedItem toAnalyzedItem(AiAnalysisItem item) {
        return new AnalyzedItem(
                item.getId(),
                item.getName(),
                item.getWeightGram().doubleValue(),
                roundedInt(item.getCalorie()),
                item.getCarb().doubleValue(),
                item.getProtein().doubleValue(),
                item.getFat().doubleValue()
        );
    }

    private int roundedInt(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP).intValue();
    }
}
