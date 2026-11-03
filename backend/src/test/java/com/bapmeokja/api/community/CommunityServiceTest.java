package com.bapmeokja.api.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import com.bapmeokja.api.diet.service.FoodImageAnalyzer;
import com.bapmeokja.api.menu.CurrentUserProvider;
import com.bapmeokja.api.user.domain.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class CommunityServiceTest {
    private static final MockMultipartFile IMAGE =
            new MockMultipartFile("image", "meal.jpg", "image/jpeg", new byte[]{1, 2, 3});

    private CommunityPostRepository postRepository;
    private CommunityCommentRepository commentRepository;
    private CommunityPostLikeRepository likeRepository;
    private CommunityImageStorage imageStorage;
    private FoodImageAnalyzer imageAnalyzer;
    private User me;
    private CommunityService service;

    @BeforeEach
    void setUp() {
        postRepository = mock(CommunityPostRepository.class);
        commentRepository = mock(CommunityCommentRepository.class);
        likeRepository = mock(CommunityPostLikeRepository.class);
        imageStorage = mock(CommunityImageStorage.class);
        imageAnalyzer = mock(FoodImageAnalyzer.class);
        CurrentUserProvider currentUserProvider = mock(CurrentUserProvider.class);
        me = user(1L);
        when(currentUserProvider.get()).thenReturn(me);
        service = new CommunityService(
                postRepository, commentRepository, likeRepository, imageStorage, currentUserProvider, imageAnalyzer
        );
    }

    @Test
    void sumsTheSharedAnalyzerResultForThePost() {
        doNothing().when(imageStorage).validate(IMAGE);
        when(imageAnalyzer.analyze(IMAGE)).thenReturn(new FoodImageAnalyzer.ImageAnalysisResult("비빔밥", List.of(
                food("밥", "300.4", "66", "5", "1"),
                food("나물", "100.3", "10", "4", "2.5")
        )));

        CommunityDtos.AnalyzeImageResponse result = service.analyzeImage(IMAGE);

        assertThat(result.foodName()).isEqualTo("비빔밥");
        assertThat(result.calorie()).isEqualTo(401);
        assertThat(result.carb()).isEqualTo(76.0);
        assertThat(result.fat()).isEqualTo(3.5);
    }

    @Test
    void photoWithoutFoodIsReportedAsAnalysisFailure() {
        when(imageAnalyzer.analyze(IMAGE)).thenReturn(new FoodImageAnalyzer.ImageAnalysisResult("", List.of()));

        assertFailsWith(ErrorCode.AI_ANALYSIS_FAILED, () -> service.analyzeImage(IMAGE));
    }

    @Test
    void blankPostIsRejectedBeforeAnythingIsStored() {
        assertFailsWith(ErrorCode.REQUIRED_VALUE_MISSING,
                () -> service.createPost(IMAGE, "   ", null, null, null, null, null));
        verify(imageStorage, never()).store(any());
        verify(postRepository, never()).save(any());
    }

    @Test
    void outOfRangeNutritionIsRejected() {
        assertFailsWith(ErrorCode.INVALID_PARAMETER,
                () -> service.createPost(null, "점심", null, 10_001, null, null, null));
        assertFailsWith(ErrorCode.INVALID_PARAMETER,
                () -> service.createPost(null, "점심", null, null, -1.0, null, null));
    }

    @Test
    void malformedMealTimeIsRejected() {
        assertFailsWith(ErrorCode.INVALID_PARAMETER,
                () -> service.createPost(null, "점심", "어제", null, null, null, null));
    }

    @Test
    void onlyTheAuthorCanEditOrDeleteAPost() {
        CommunityPost post = post(user(2L));
        when(postRepository.findLockedById("post")).thenReturn(Optional.of(post));

        assertFailsWith(ErrorCode.FORBIDDEN,
                () -> service.updatePost("post", new CommunityDtos.UpdatePostRequest("수정")));
        assertFailsWith(ErrorCode.FORBIDDEN, () -> service.deletePost("post"));
        verify(post, never()).updateContent(any());
        verify(postRepository, never()).delete(any());
    }

    @Test
    void deletingAPostRemovesItsCommentsLikesAndImage() {
        CommunityPost post = post(me);
        when(post.getImageUrl()).thenReturn("/v1/uploads/community/a.jpg");
        when(postRepository.findLockedById("post")).thenReturn(Optional.of(post));

        service.deletePost("post");

        verify(likeRepository).deleteAllByPost_Id("post");
        verify(commentRepository).deleteAllByPost_Id("post");
        verify(postRepository).delete(post);
        verify(imageStorage).delete("/v1/uploads/community/a.jpg");
    }

    @Test
    void onlyTheAuthorCanDeleteAComment() {
        CommunityComment comment = mock(CommunityComment.class);
        User other = user(2L);
        when(comment.getUser()).thenReturn(other);
        when(commentRepository.findByIdAndPost_Id("cmt", "post")).thenReturn(Optional.of(comment));

        assertFailsWith(ErrorCode.FORBIDDEN, () -> service.deleteComment("post", "cmt"));
        verify(commentRepository, never()).delete(any());
    }

    @Test
    void likeTogglesOnAndOff() {
        CommunityPost post = post(user(2L));
        when(postRepository.findLockedById("post")).thenReturn(Optional.of(post));
        when(likeRepository.findByPost_IdAndUser_Id("post", 1L)).thenReturn(Optional.empty());

        assertThat(service.toggleLike("post").isLiked()).isTrue();
        verify(post).increaseLikeCount();

        CommunityPostLike like = mock(CommunityPostLike.class);
        when(likeRepository.findByPost_IdAndUser_Id("post", 1L)).thenReturn(Optional.of(like));

        assertThat(service.toggleLike("post").isLiked()).isFalse();
        verify(likeRepository).delete(like);
        verify(post).decreaseLikeCount();
    }

    @Test
    void missingPostIsNotFound() {
        when(postRepository.findLockedById("none")).thenReturn(Optional.empty());

        assertFailsWith(ErrorCode.RESOURCE_NOT_FOUND, () -> service.toggleLike("none"));
    }

    private void assertFailsWith(ErrorCode code, org.assertj.core.api.ThrowableAssert.ThrowingCallable call) {
        assertThatThrownBy(call).isInstanceOfSatisfying(BusinessException.class,
                exception -> assertThat(exception.getErrorCode()).isEqualTo(code));
    }

    private User user(Long id) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        return user;
    }

    private CommunityPost post(User author) {
        CommunityPost post = mock(CommunityPost.class);
        when(post.getUser()).thenReturn(author);
        return post;
    }

    private FoodImageAnalyzer.DetectedFood food(String name, String calorie, String carb, String protein, String fat) {
        return new FoodImageAnalyzer.DetectedFood(
                null, name, BigDecimal.valueOf(100), new BigDecimal(calorie), new BigDecimal(carb),
                new BigDecimal(protein), new BigDecimal(fat), BigDecimal.ZERO, BigDecimal.ZERO
        );
    }
}
