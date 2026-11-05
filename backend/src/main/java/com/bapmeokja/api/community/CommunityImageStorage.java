package com.bapmeokja.api.community;

import com.bapmeokja.api.common.exception.BusinessException;
import com.bapmeokja.api.common.exception.ErrorCode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class CommunityImageStorage {
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/heic", ".heic",
            "image/heif", ".heic"
    );

    private final CommunityImageRepository repository;
    // 예전에 디스크에 저장한 사진을 읽을 때만 쓴다.
    private final Path directory;

    public CommunityImageStorage(
            CommunityImageRepository repository,
            @Value("${app.upload.directory:./uploads}") String uploadDirectory
    ) {
        this.repository = repository;
        this.directory = Path.of(uploadDirectory).toAbsolutePath().normalize().resolve("community");
    }

    public String store(MultipartFile file) {
        validate(file);
        String contentType = file.getContentType().toLowerCase(Locale.ROOT);
        String fileName = UUID.randomUUID().toString().replace("-", "") + EXTENSIONS.get(contentType);
        try {
            repository.save(new CommunityImage(fileName, contentType, file.getBytes()));
            return "/v1/uploads/community/" + fileName;
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "이미지를 저장하지 못했습니다.");
        }
    }

    public Resource load(String fileName) {
        if (!fileName.matches("[a-f0-9]{32}\\.(jpg|png|heic)")) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "이미지를 찾을 수 없습니다.");
        }
        return repository.findById(fileName)
                .<Resource>map(image -> new ByteArrayResource(image.getData()))
                .orElseGet(() -> loadFromDisk(fileName));
    }

    private Resource loadFromDisk(String fileName) {
        Path file = directory.resolve(fileName).normalize();
        if (!file.startsWith(directory) || !Files.isRegularFile(file)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "이미지를 찾을 수 없습니다.");
        }
        return new FileSystemResource(file);
    }

    public void delete(String imageUrl) {
        String prefix = "/v1/uploads/community/";
        if (imageUrl == null || !imageUrl.startsWith(prefix)) {
            return;
        }
        String fileName = imageUrl.substring(prefix.length());
        if (!fileName.matches("[a-f0-9]{32}\\.(jpg|png|heic)")) {
            return;
        }
        repository.deleteById(fileName);
        try {
            Files.deleteIfExists(directory.resolve(fileName).normalize());
        } catch (IOException ignored) {
            // 게시글 삭제 성공 여부가 파일 정리 실패에 좌우되지 않도록 한다.
        }
    }

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.IMAGE_REQUIRED, "이미지를 첨부해주세요.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !EXTENSIONS.containsKey(contentType.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ErrorCode.INVALID_PARAMETER, "jpg, jpeg, png, heic 이미지만 업로드할 수 있습니다.");
        }
    }
}
