package com.bapmeokja.api.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class CommunityDtos {
    private CommunityDtos() {
    }

    public record PostListResponse(
            List<PostSummary> posts,
            long totalCount,
            int page,
            int size,
            boolean hasNext
    ) {
    }

    public record PostSummary(
            String postId,
            String title,
            String authorNickname,
            Instant createdAt,
            String thumbnailUrl,
            int likeCount,
            int commentCount
    ) {
    }

    public record AnalyzeImageResponse(
            String foodName,
            int calorie,
            double carb,
            double protein,
            double fat
    ) {
    }

    public record CreatePostResponse(String postId) {
    }

    public record UpdatePostRequest(
            @NotBlank(message = "게시글 내용을 입력해주세요.")
            @Size(max = 5000, message = "게시글은 5000자 이내로 입력해주세요.")
            String content
    ) {
    }

    public record PostDetailResponse(
            String postId,
            String content,
            String imageUrl,
            String authorNickname,
            Instant createdAt,
            int likeCount,
            boolean isLiked,
            int commentCount,
            NutritionInfo nutritionInfo,
            List<CommentResponse> comments
    ) {
    }

    public record NutritionInfo(
            String foodName,
            Integer calorie,
            Double carb,
            Double protein,
            Double fat
    ) {
    }

    public record CommentResponse(
            String commentId,
            String authorNickname,
            String content,
            Instant createdAt
    ) {
    }

    public record CreateCommentRequest(
            @NotBlank(message = "댓글 내용을 입력해주세요.")
            @Size(max = 1000, message = "댓글은 1000자 이내로 입력해주세요.")
            String content
    ) {
    }

    public record CreateCommentResponse(String commentId) {
    }

    public record LikeResponse(boolean isLiked, int likeCount) {
    }
}
