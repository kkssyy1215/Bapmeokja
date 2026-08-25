package com.bapmeokja.api.fridge;

import com.bapmeokja.api.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/fridge/ingredients")
@RequiredArgsConstructor
public class FridgeController {
    private final FridgeService fridgeService;

    @PostMapping
    public ResponseEntity<ApiResponse<FridgeDtos.CreateResponse>> create(
            @Valid @RequestBody FridgeDtos.CreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(fridgeService.create(request), "재료가 등록되었습니다."));
    }

    @GetMapping
    public ApiResponse<FridgeDtos.ListResponse> getAll() {
        return ApiResponse.success(fridgeService.getAll(), "조회 성공");
    }

    @PutMapping("/{ingredientId}")
    public ApiResponse<Void> update(
            @PathVariable String ingredientId,
            @Valid @RequestBody FridgeDtos.UpdateRequest request
    ) {
        fridgeService.update(ingredientId, request);
        return ApiResponse.success(null, "재료가 수정되었습니다.");
    }

    @DeleteMapping("/{ingredientId}")
    public ApiResponse<Void> delete(@PathVariable String ingredientId) {
        fridgeService.delete(ingredientId);
        return ApiResponse.success(null, "재료가 삭제되었습니다.");
    }
}
