package com.revolt.showroom.dto;

import com.revolt.showroom.entity.BikeImage;

import java.util.UUID;

public record BikeImageResponse(UUID id, String url, UUID colorId, boolean isPrimary, int sortOrder) {
    public static BikeImageResponse from(BikeImage image) {
        return new BikeImageResponse(image.getId(), image.getUrl(), image.getColorId(), image.isPrimary(), image.getSortOrder());
    }
}
