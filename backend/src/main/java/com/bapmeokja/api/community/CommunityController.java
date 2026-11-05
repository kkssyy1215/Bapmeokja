package com.bapmeokja.api.community;

import com.bapmeokja.api.common.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Validated
@RestController
@RequestMapping("/v1/community")
@RequiredArgsConstructor
public class CommunityController {
    private final CommunityService communityService;

    @GetMapping("/posts")
    public ApiResponse<CommunityDtos.PostListResponse> getPosts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size
    ) {
        return ApiResponse.success(communityService.getPosts(page, size), "조회 성공");
    }

    @PostMapping(path = "/analyze-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CommunityDtos.AnalyzeImageResponse> analyzeImage(
            @RequestPart("image") MultipartFile image
    ) {
        return ApiResponse.success(communityService.analyzeImage(image), "AI 분석이 완료되었습니다.");
    }

    @PostMapping(path = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CommunityDtos.CreatePostResponse>> createPost(
            @RequestPart(name = "image", required = false) MultipartFile image,
            @RequestParam String content,
            @RequestParam(required = false) String eatenAt,
            @RequestParam(required = false) Integer calorie,
            @RequestParam(required = false) Double carb,
            @RequestParam(required = false) Double protein,
            @RequestParam(required = false) Double fat
    ) {
        CommunityDtos.CreatePostResponse response = communityService.createPost(
                image,
                content,
                eatenAt,
                calorie,
                carb,
                protein,
                fat
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "게시글이 등록되었습니다."));
    }

    @GetMapping("/posts/{postId}")
    public ApiResponse<CommunityDtos.PostDetailResponse> getPost(@PathVariable String postId) {
        return ApiResponse.success(communityService.getPost(postId), "조회 성공");
    }

    @PutMapping("/posts/{postId}")
    public ApiResponse<Void> updatePost(
            @PathVariable String postId,
            @Valid @RequestBody CommunityDtos.UpdatePostRequest request
    ) {
        communityService.updatePost(postId, request);
        return ApiResponse.success(null, "게시글이 수정되었습니다.");
    }

    @DeleteMapping("/posts/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable String postId) {
        communityService.deletePost(postId);
        return ApiResponse.success(null, "게시글이 삭제되었습니다.");
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<CommunityDtos.CreateCommentResponse>> createComment(
            @PathVariable String postId,
            @Valid @RequestBody CommunityDtos.CreateCommentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        communityService.createComment(postId, request),
                        "댓글이 등록되었습니다."
                ));
    }

    @PutMapping("/posts/{postId}/comments/{commentId}")
    public ApiResponse<Void> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @Valid @RequestBody CommunityDtos.UpdateCommentRequest request
    ) {
        communityService.updateComment(postId, commentId, request);
        return ApiResponse.success(null, "댓글이 수정되었습니다.");
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ApiResponse<Void> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId
    ) {
        communityService.deleteComment(postId, commentId);
        return ApiResponse.success(null, "댓글이 삭제되었습니다.");
    }

    @PostMapping("/posts/{postId}/likes")
    public ApiResponse<CommunityDtos.LikeResponse> toggleLike(@PathVariable String postId) {
        return ApiResponse.success(communityService.toggleLike(postId), "좋아요가 처리되었습니다.");
    }
}
