package com.bapmeokja.api.diet.service;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ResourceIdGenerator {

    public String next(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
