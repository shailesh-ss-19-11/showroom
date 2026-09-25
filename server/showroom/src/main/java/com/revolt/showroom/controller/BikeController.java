package com.revolt.showroom.controller;

import tools.jackson.databind.JsonNode;
import com.revolt.showroom.dto.*;
import com.revolt.showroom.security.CurrentAdmin;
import com.revolt.showroom.service.BikeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    private final BikeService bikeService;

    public BikeController(BikeService bikeService) {
        this.bikeService = bikeService;
    }

    @GetMapping
    public List<BikeResponse> list(
        @RequestParam(required = false) String brand,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) Boolean featured,
        @RequestParam(required = false) String sort,
        @RequestParam(required = false) String status
    ) {
        boolean isAdmin = CurrentAdmin.get().isPresent();
        return bikeService.list(brand, category, search, minPrice, maxPrice, featured, sort, status, isAdmin);
    }

    @GetMapping("/meta")
    public BikeMetaResponse meta() {
        return bikeService.meta();
    }

    @GetMapping("/{id}")
    public BikeResponse get(@PathVariable UUID id) {
        boolean isAdmin = CurrentAdmin.get().isPresent();
        return bikeService.get(id, isAdmin);
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public BikeResponse create(
        @RequestParam String name,
        @RequestParam String brand,
        @RequestParam String category,
        @RequestParam String price,
        @RequestParam(required = false) String batteryCapacityKwh,
        @RequestParam(required = false) String rangeKm,
        @RequestParam(required = false) String chargingTimeHours,
        @RequestParam(required = false) String topSpeedKmph,
        @RequestParam(required = false) String power,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) String featured,
        @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        return bikeService.create(
            name, brand, category, price, batteryCapacityKwh, rangeKm, chargingTimeHours,
            topSpeedKmph, power, description, featured, images
        );
    }

    @PutMapping("/{id}")
    public BikeResponse update(@PathVariable UUID id, @RequestBody JsonNode body) {
        return bikeService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        bikeService.delete(id);
    }

    @PatchMapping("/bulk")
    public BulkActionResult bulkUpdate(@RequestBody BulkActionRequest request) {
        return bikeService.bulkUpdate(request);
    }

    @PostMapping("/{id}/duplicate")
    @ResponseStatus(HttpStatus.CREATED)
    public BikeResponse duplicate(@PathVariable UUID id) {
        return bikeService.duplicate(id);
    }

    @PostMapping("/{id}/colors")
    @ResponseStatus(HttpStatus.CREATED)
    public BikeColorResponse addColor(@PathVariable UUID id, @Valid @RequestBody ColorRequest request) {
        return bikeService.addColor(id, request);
    }

    @DeleteMapping("/{id}/colors/{colorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteColor(@PathVariable UUID id, @PathVariable UUID colorId) {
        bikeService.deleteColor(id, colorId);
    }

    @PostMapping("/{id}/images")
    @ResponseStatus(HttpStatus.CREATED)
    public BikeImageResponse addImage(@PathVariable UUID id, @Valid @RequestBody ImageAddRequest request) {
        return bikeService.addImage(id, request);
    }

    @PatchMapping("/{id}/images/reorder")
    public BikeResponse reorderImages(@PathVariable UUID id, @RequestBody ReorderRequest request) {
        return bikeService.reorderImages(id, request.order());
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(@PathVariable UUID id, @PathVariable UUID imageId) {
        bikeService.deleteImage(id, imageId);
    }
}
