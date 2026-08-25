package com.bapmeokja.api.diet.config;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class DietUploadWebConfig implements WebMvcConfigurer {

    private final String uploadLocation;

    public DietUploadWebConfig(@Value("${app.upload.directory:./uploads}") String uploadDirectory) {
        String uri = Path.of(uploadDirectory).toAbsolutePath().normalize().toUri().toString();
        this.uploadLocation = uri.endsWith("/") ? uri : uri + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation)
                .setCachePeriod(3600);
    }
}
