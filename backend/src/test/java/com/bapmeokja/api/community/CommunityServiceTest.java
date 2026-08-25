package com.bapmeokja.api.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;

import com.bapmeokja.api.menu.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class CommunityServiceTest {
    private CommunityImageStorage imageStorage;
    private CommunityService service;

    @BeforeEach
    void setUp() {
        imageStorage = mock(CommunityImageStorage.class);
        service = new CommunityService(
                mock(CommunityPostRepository.class),
                mock(CommunityCommentRepository.class),
                mock(CommunityPostLikeRepository.class),
                imageStorage,
                mock(CurrentUserProvider.class)
        );
    }

    @Test
    void returnsSafeDefaultNutritionWhenAnalyzerProviderIsNotConfigured() {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "meal.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );
        doNothing().when(imageStorage).validate(image);

        CommunityDtos.AnalyzeImageResponse result = service.analyzeImage(image);

        assertThat(result.foodName()).isEqualTo("도시락");
        assertThat(result.calorie()).isEqualTo(650);
        assertThat(result.protein()).isEqualTo(30.0);
    }
}
