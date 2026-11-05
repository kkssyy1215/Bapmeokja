package com.bapmeokja.api.community;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.diet.service.FoodImageAnalyzer;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.user.domain.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityService {
    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final CommunityPostLikeRepository postLikeRepository;
    private final CommunityImageStorage imageStorage;
    private final CurrentUserProvider currentUserProvider;
    private final FoodImageAnalyzer imageAnalyzer;

    public CommunityDtos.PostListResponse getPosts(int page, int size) {
        Page<CommunityPost> result = postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        List<CommunityDtos.PostSummary> posts = result.getContent().stream()
                .map(post -> new CommunityDtos.PostSummary(
                        post.getId(),
                        titleOf(post.getContent()),
                        post.getUser().getNickname(),
                        post.getCreatedAt(),
                        post.getImageUrl(),
                        post.getLikeCount(),
                        post.getCommentCount()
                ))
                .toList();
        return new CommunityDtos.PostListResponse(
                posts,
                result.getTotalElements(),
                page,
                size,
                result.hasNext()
        );
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public CommunityDtos.AnalyzeImageResponse analyzeImage(MultipartFile image) {
        imageStorage.validate(image);
        FoodImageAnalyzer.ImageAnalysisResult result = imageAnalyzer.analyze(image);
        if (result.items() == null || result.items().isEmpty()) {
            throw new BusinessException(ErrorCode.AI_ANALYSIS_FAILED);
        }
        return new CommunityDtos.AnalyzeImageResponse(
                result.foodName(),
                sum(result, FoodImageAnalyzer.DetectedFood::calorie).setScale(0, RoundingMode.HALF_UP).intValue(),
                sum(result, FoodImageAnalyzer.DetectedFood::carb).doubleValue(),
                sum(result, FoodImageAnalyzer.DetectedFood::protein).doubleValue(),
                sum(result, FoodImageAnalyzer.DetectedFood::fat).doubleValue()
        );
    }

    private BigDecimal sum(
            FoodImageAnalyzer.ImageAnalysisResult result,
            Function<FoodImageAnalyzer.DetectedFood, BigDecimal> nutrient
    ) {
        return result.items().stream().map(nutrient).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public CommunityDtos.CreatePostResponse createPost(
            MultipartFile image,
            String content,
            String eatenAt,
            Integer calorie,
            Double carb,
            Double protein,
            Double fat
    ) {
        if (content == null || content.isBlank()) {
            throw new BusinessException(ErrorCode.REQUIRED_VALUE_MISSING, "게시글 내용을 입력해주세요.");
        }
        if (content.length() > 5000) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "게시글은 5000자 이내로 입력해주세요.");
        }
        validateNutrition(calorie, carb, protein, fat);
        User user = currentUserProvider.get();
        String imageUrl = image == null || image.isEmpty() ? null : imageStorage.store(image);
        String foodName = calorie == null && carb == null && protein == null && fat == null ? null : "식사";
        CommunityPost post = new CommunityPost(
                nextId("post_"),
                user,
                content.trim(),
                imageUrl,
                parseInstant(eatenAt),
                foodName,
                calorie,
                carb,
                protein,
                fat
        );
        postRepository.save(post);
        return new CommunityDtos.CreatePostResponse(post.getId());
    }

    public CommunityDtos.PostDetailResponse getPost(String postId) {
        User user = currentUserProvider.get();
        CommunityPost post = findPost(postId);
        List<CommunityDtos.CommentResponse> comments = commentRepository
                .findAllByPost_IdOrderByCreatedAtAsc(postId)
                .stream()
                .map(comment -> new CommunityDtos.CommentResponse(
                        comment.getId(),
                        comment.getUser().getNickname(),
                        comment.getContent(),
                        comment.getCreatedAt(),
                        comment.getParentId()
                ))
                .toList();
        CommunityDtos.NutritionInfo nutritionInfo = post.getFoodName() == null
                ? null
                : new CommunityDtos.NutritionInfo(
                        post.getFoodName(),
                        post.getCalorie(),
                        post.getCarb(),
                        post.getProtein(),
                        post.getFat()
                );
        return new CommunityDtos.PostDetailResponse(
                post.getId(),
                post.getContent(),
                post.getImageUrl(),
                post.getUser().getNickname(),
                post.getCreatedAt(),
                post.getLikeCount(),
                postLikeRepository.existsByPost_IdAndUser_Id(postId, user.getId()),
                post.getCommentCount(),
                nutritionInfo,
                comments
        );
    }

    @Transactional
    public void updatePost(String postId, CommunityDtos.UpdatePostRequest request) {
        CommunityPost post = findLockedPost(postId);
        requireOwner(post.getUser().getId(), "본인의 게시글만 수정할 수 있습니다.");
        post.updateContent(request.content().trim());
    }

    @Transactional
    public void deletePost(String postId) {
        CommunityPost post = findLockedPost(postId);
        requireOwner(post.getUser().getId(), "본인의 게시글만 삭제할 수 있습니다.");
        postLikeRepository.deleteAllByPost_Id(postId);
        commentRepository.deleteAllByPost_Id(postId);
        postRepository.delete(post);
        imageStorage.delete(post.getImageUrl());
    }

    @Transactional
    public CommunityDtos.CreateCommentResponse createComment(
            String postId,
            CommunityDtos.CreateCommentRequest request
    ) {
        User user = currentUserProvider.get();
        CommunityPost post = findLockedPost(postId);
        CommunityComment comment = new CommunityComment(
                nextId("cmt_"),
                post,
                user,
                request.content().trim(),
                resolveParentId(postId, request.parentCommentId())
        );
        commentRepository.save(comment);
        post.increaseCommentCount();
        return new CommunityDtos.CreateCommentResponse(comment.getId());
    }

    @Transactional
    public void updateComment(String postId, String commentId, CommunityDtos.UpdateCommentRequest request) {
        CommunityComment comment = commentRepository.findByIdAndPost_Id(commentId, postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 댓글입니다."));
        requireOwner(comment.getUser().getId(), "본인의 댓글만 수정할 수 있습니다.");
        comment.updateContent(request.content().trim());
    }

    @Transactional
    public void deleteComment(String postId, String commentId) {
        CommunityComment comment = commentRepository.findByIdAndPost_Id(commentId, postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 댓글입니다."));
        requireOwner(comment.getUser().getId(), "본인의 댓글만 삭제할 수 있습니다.");
        CommunityPost post = findLockedPost(postId);
        // 댓글을 지우면 달린 답글도 함께 지운다.
        if (comment.getParentId() == null) {
            List<CommunityComment> replies = commentRepository.findAllByPost_IdAndParentId(postId, commentId);
            commentRepository.deleteAll(replies);
            replies.forEach(reply -> post.decreaseCommentCount());
        }
        post.decreaseCommentCount();
        commentRepository.delete(comment);
    }

    /** 답글은 한 단계만 둔다. 답글에 답글을 달면 원래 댓글 아래에 붙인다. */
    private String resolveParentId(String postId, String parentCommentId) {
        if (parentCommentId == null || parentCommentId.isBlank()) {
            return null;
        }
        CommunityComment parent = commentRepository.findByIdAndPost_Id(parentCommentId, postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 댓글입니다."));
        return parent.getParentId() == null ? parent.getId() : parent.getParentId();
    }

    @Transactional
    public CommunityDtos.LikeResponse toggleLike(String postId) {
        User user = currentUserProvider.get();
        CommunityPost post = findLockedPost(postId);
        return postLikeRepository.findByPost_IdAndUser_Id(postId, user.getId())
                .map(like -> {
                    postLikeRepository.delete(like);
                    post.decreaseLikeCount();
                    return new CommunityDtos.LikeResponse(false, post.getLikeCount());
                })
                .orElseGet(() -> {
                    postLikeRepository.save(new CommunityPostLike(post, user));
                    post.increaseLikeCount();
                    return new CommunityDtos.LikeResponse(true, post.getLikeCount());
                });
    }

    private CommunityPost findPost(String postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 게시글입니다."));
    }

    private CommunityPost findLockedPost(String postId) {
        return postRepository.findLockedById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 게시글입니다."));
    }

    private void requireOwner(Long ownerId, String message) {
        if (!ownerId.equals(currentUserProvider.get().getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, message);
        }
    }

    private Instant parseInstant(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(value);
        } catch (DateTimeParseException exception) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "식사 시각 형식을 확인해주세요.");
        }
    }

    private void validateNutrition(Integer calorie, Double carb, Double protein, Double fat) {
        if (calorie != null && (calorie < 0 || calorie > 10_000)) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "칼로리 범위를 확인해주세요.");
        }
        for (Double value : List.of(
                carb == null ? 0.0 : carb,
                protein == null ? 0.0 : protein,
                fat == null ? 0.0 : fat
        )) {
            if (value < 0 || value > 1_000) {
                throw new BusinessException(ErrorCode.INVALID_PARAMETER, "영양 정보 범위를 확인해주세요.");
            }
        }
    }

    private String titleOf(String content) {
        String compact = content.replaceAll("\\s+", " ").trim();
        return compact.length() <= 24 ? compact : compact.substring(0, 24) + "…";
    }

    private String nextId(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
