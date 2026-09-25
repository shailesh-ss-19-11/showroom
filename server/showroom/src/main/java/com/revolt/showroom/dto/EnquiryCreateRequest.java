package com.revolt.showroom.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record EnquiryCreateRequest(
    @NotBlank String name,
    @NotBlank String phone,
    String email,
    String message,
    UUID bikeId,
    String source
) {
}
