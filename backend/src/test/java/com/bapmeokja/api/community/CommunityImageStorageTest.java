package com.bapmeokja.api.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bapmeokja.api.common.exception.BusinessException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

class CommunityImageStorageTest {
    private static final byte[] BYTES = {1, 2, 3, 4};
    private static final String NAME = "0123456789abcdef0123456789abcdef.jpg";

    @TempDir
    Path uploadDirectory;

    private CommunityImageRepository repository;
    private CommunityImageStorage storage;

    @BeforeEach
    void setUp() {
        repository = mock(CommunityImageRepository.class);
        storage = new CommunityImageStorage(repository, uploadDirectory.toString());
    }

    @Test
    void storesImagesInTheDatabaseAndNotOnDisk() throws IOException {
        String url = storage.store(new MockMultipartFile("image", "meal.jpg", "image/jpeg", BYTES));

        ArgumentCaptor<CommunityImage> saved = ArgumentCaptor.forClass(CommunityImage.class);
        verify(repository).save(saved.capture());
        assertThat(url).isEqualTo("/v1/uploads/community/" + saved.getValue().getFileName());
        assertThat(saved.getValue().getData()).isEqualTo(BYTES);
        assertThat(saved.getValue().getContentType()).isEqualTo("image/jpeg");
        assertThat(Files.exists(uploadDirectory.resolve("community"))).isFalse();
    }

    @Test
    void loadsImagesFromTheDatabase() throws IOException {
        when(repository.findById(NAME)).thenReturn(Optional.of(new CommunityImage(NAME, "image/jpeg", BYTES)));

        Resource resource = storage.load(NAME);

        assertThat(resource.getContentAsByteArray()).isEqualTo(BYTES);
    }

    @Test
    void stillLoadsOlderImagesSavedOnDisk() throws IOException {
        when(repository.findById(NAME)).thenReturn(Optional.empty());
        Files.createDirectories(uploadDirectory.resolve("community"));
        Files.write(uploadDirectory.resolve("community").resolve(NAME), BYTES);

        assertThat(storage.load(NAME).getContentAsByteArray()).isEqualTo(BYTES);
    }

    @Test
    void missingImageIsNotFound() {
        when(repository.findById(NAME)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> storage.load(NAME)).isInstanceOf(BusinessException.class);
    }

    @Test
    void rejectsUnsafeFileNames() {
        assertThatThrownBy(() -> storage.load("../secret.jpg")).isInstanceOf(BusinessException.class);
        verify(repository, never()).findById(any());
    }

    @Test
    void deletesImagesFromTheDatabase() {
        storage.delete("/v1/uploads/community/" + NAME);

        verify(repository).deleteById(NAME);
    }
}
