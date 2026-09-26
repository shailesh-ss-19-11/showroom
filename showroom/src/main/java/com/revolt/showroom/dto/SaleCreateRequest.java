package com.revolt.showroom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record SaleCreateRequest(
    UUID bikeId,
    @NotBlank String customerName,
    @NotBlank String customerPhone,
    String customerEmail,
    @NotNull BigDecimal salePrice,
    String paymentStatus,
    String notes,
    UUID enquiryId,
    UUID bookingId,
    UUID soldById
) {
}
