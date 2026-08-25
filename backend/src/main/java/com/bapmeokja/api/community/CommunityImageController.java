package com.bapmeokja.api.community;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/uploads/community")
@RequiredArgsConstructor
public class CommunityImageController {
    private final CommunityImageStorage imageStorage;

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) {
        Resource resource = imageStorage.load(fileName);
        MediaType mediaType = fileName.endsWith(".png")
                ? MediaType.IMAGE_PNG
                : fileName.endsWith(".heic")
                        ? MediaType.parseMediaType("image/heic")
                        : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(resource);
    }
}
