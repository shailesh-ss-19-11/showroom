package com.revolt.showroom.controller;

import com.revolt.showroom.dto.UploadResponse;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.service.PublicUrlService;
import com.revolt.showroom.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/avif");

    private final StorageService storageService;
    private final PublicUrlService publicUrlService;

    public UploadController(StorageService storageService, PublicUrlService publicUrlService) {
        this.storageService = storageService;
        this.publicUrlService = publicUrlService;
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse upload(@RequestParam("image") MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw ApiException.badRequest("No image file provided");
        }
        if (!ALLOWED_TYPES.contains(image.getContentType())) {
            throw ApiException.badRequest("Only JPEG, PNG, WEBP, or AVIF images are allowed");
        }

        String key = storageService.generateKey(image.getOriginalFilename());
        try {
            storageService.uploadObject(key, image.getBytes(), image.getContentType());
        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded file", e);
        }
        return new UploadResponse(publicUrlService.buildFileUrl(key));
    }
}
