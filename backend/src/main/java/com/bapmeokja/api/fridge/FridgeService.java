package com.bapmeokja.api.fridge;

import com.bapmeokja.api.common.time.AppTime;
import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.user.domain.User;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FridgeService {
    private final FridgeIngredientRepository repository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public FridgeDtos.CreateResponse create(FridgeDtos.CreateRequest request) {
        User user = currentUserProvider.get();
        List<FridgeIngredient> ingredients = request.ingredients().stream()
                .map(input -> new FridgeIngredient(
                        nextId(),
                        user,
                        input.name().trim(),
                        input.quantity(),
                        input.unit().trim(),
                        input.expiryDate()
                ))
                .toList();
        repository.saveAll(ingredients);
        return new FridgeDtos.CreateResponse(ingredients.size());
    }

    public FridgeDtos.ListResponse getAll() {
        User user = currentUserProvider.get();
        LocalDate today = AppTime.today();
        List<FridgeDtos.IngredientResponse> items = repository
                .findAllByUser_IdOrderByExpiryDateAscCreatedAtDesc(user.getId())
                .stream()
                .map(item -> new FridgeDtos.IngredientResponse(
                        item.getId(),
                        item.getName(),
                        item.getQuantity(),
                        item.getUnit(),
                        item.getExpiryDate(),
                        item.getExpiryDate() != null && !item.getExpiryDate().isAfter(today.plusDays(3))
                ))
                .toList();
        return new FridgeDtos.ListResponse(items);
    }

    @Transactional
    public void update(String ingredientId, FridgeDtos.UpdateRequest request) {
        User user = currentUserProvider.get();
        FridgeIngredient ingredient = ownedIngredient(ingredientId, user.getId());
        ingredient.update(request.quantity(), request.unit().trim(), request.expiryDate());
    }

    @Transactional
    public void delete(String ingredientId) {
        User user = currentUserProvider.get();
        repository.delete(ownedIngredient(ingredientId, user.getId()));
    }

    private FridgeIngredient ownedIngredient(String ingredientId, Long userId) {
        return repository.findByIdAndUser_Id(ingredientId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 재료입니다."));
    }

    private String nextId() {
        return "ing_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
