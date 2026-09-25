package com.revolt.showroom.dto;

import com.revolt.showroom.entity.Bike;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BikeResponse(
    UUID id,
    String name,
    String brand,
    String category,
    BigDecimal price,
    Double batteryCapacityKwh,
    Double rangeKm,
    Double chargingTimeHours,
    Double topSpeedKmph,
    String power,
    String description,
    boolean featured,
    boolean isActive,
    List<BikeColorResponse> colors,
    List<BikeImageResponse> images,
    Instant createdAt,
    Instant updatedAt
) {
    public static BikeResponse from(Bike bike) {
        return new BikeResponse(
            bike.getId(),
            bike.getName(),
            bike.getBrand(),
            bike.getCategory(),
            bike.getPrice(),
            bike.getBatteryCapacityKwh(),
            bike.getRangeKm(),
            bike.getChargingTimeHours(),
            bike.getTopSpeedKmph(),
            bike.getPower(),
            bike.getDescription(),
            bike.isFeatured(),
            bike.getIsActive(),
            bike.getColors().stream().map(BikeColorResponse::from).toList(),
            bike.getImages().stream().map(BikeImageResponse::from).toList(),
            bike.getCreatedAt(),
            bike.getUpdatedAt()
        );
    }
}
