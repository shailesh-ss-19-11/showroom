package com.revolt.showroom.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record BookingCreateRequest(
    @NotBlank String name,
    @NotBlank String phone,
    String email,
    UUID bikeId,
    String preferredDate,
    UUID slotId,
    String notes
) {
}
