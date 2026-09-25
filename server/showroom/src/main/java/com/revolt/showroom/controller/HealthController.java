package com.revolt.showroom.controller;

import com.revolt.showroom.dto.HealthResponse;
import com.revolt.showroom.service.StorageService;
import jakarta.persistence.EntityManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;

@RestController
public class HealthController {

    private final EntityManager entityManager;
    private final StorageService storageService;

    public HealthController(EntityManager entityManager, StorageService storageService) {
        this.entityManager = entityManager;
        this.storageService = storageService;
    }

    @GetMapping("/api/health")
    @Transactional(readOnly = true)
    public ResponseEntity<HealthResponse> health() {
        String db = "up";
        String storage = "up";

        try {
            entityManager.createNativeQuery("select 1").getSingleResult();
        } catch (Exception e) {
            db = "down";
        }

        try {
            storageService.checkBucketHealth();
        } catch (Exception e) {
            storage = "down";
        }

        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        boolean ok = "up".equals(db) && "up".equals(storage);
        HealthResponse body = new HealthResponse(ok ? "ok" : "error", uptimeSeconds, Instant.now().toString(), db, storage);

        return ResponseEntity.status(ok ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }
}
