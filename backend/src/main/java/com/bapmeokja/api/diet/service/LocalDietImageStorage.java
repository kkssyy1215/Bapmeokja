package com.bapmeokja.api.diet.service;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalDietImageStorage implements DietImageStorage {

    private static final long MAX_IMAGE_SIZE = 10L * 1024L * 1024L;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "heic");
    private static final Map<String, String> CONTENT_TYPE_EXTENSIONS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/heic", "heic",
            "image/heif", "heic"
    );

    private final Path uploadRoot;

    public LocalDietImageStorage(@Value("${app.upload.directory:./uploads}") String uploadDirectory) {
        this.uploadRoot = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile image) {
        validate(image);
        String extension = resolveExtension(image);
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        Path dietDirectory = uploadRoot.resolve("diet").normalize();
        Path destination = dietDirectory.resolve(filename).normalize();
        if (!destination.startsWith(dietDirectory)) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "올바르지 않은 이미지 파일명입니다.");
        }

        try {
            Files.createDirectories(dietDirectory);
            try (InputStream input = image.getInputStream()) {
                Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/diet/" + filename;
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "이미지를 저장하지 못했습니다.");
        }
    }

    private void validate(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new BusinessException(ErrorCode.IMAGE_REQUIRED);
        }
        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "이미지는 10MB 이하만 업로드할 수 있습니다.");
        }
        String extension = resolveExtension(image);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "jpg, jpeg, png, heic 이미지만 업로드할 수 있습니다.");
        }
    }

    private String resolveExtension(MultipartFile image) {
        String contentType = image.getContentType();
        if (contentType != null) {
            String fromContentType = CONTENT_TYPE_EXTENSIONS.get(contentType.toLowerCase(Locale.ROOT));
            if (fromContentType != null) {
                return fromContentType;
            }
        }
        String originalFilename = image.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
