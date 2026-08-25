package com.bapmeokja.api.diet.service;

import org.springframework.web.multipart.MultipartFile;

public interface DietImageStorage {
    String store(MultipartFile image);
}
