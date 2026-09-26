package com.revolt.showroom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BikeCreateRequest(
    @NotBlank String name,
    @NotBlank String brand,
    @NotBlank String category,
    @NotNull BigDecimal price,
    Double batteryCapacityKwh,
    Double rangeKm,
    Double chargingTimeHours,
    Double topSpeedKmph,
    String power,
    String description,
    Boolean featured
) {
}
