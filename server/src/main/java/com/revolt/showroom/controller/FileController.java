package com.revolt.showroom.controller;

import com.revolt.showroom.service.StorageObjectNotFoundException;
import com.revolt.showroom.service.StorageService;
import com.revolt.showroom.service.StoredFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FileController {

    private final StorageService storageService;

    public FileController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping("/uploads/{key}")
    public ResponseEntity<byte[]> getFile(@PathVariable String key) {
        try {
            StoredFile file = storageService.getObject(key);
            String contentType = file.contentType();

            return ResponseEntity.ok()
                .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                .body(file.content());
        } catch (StorageObjectNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
        }
    }
}
