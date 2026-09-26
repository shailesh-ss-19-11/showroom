package com.revolt.showroom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AttendanceUpsertRequest(
    @NotNull UUID adminId,
    @NotBlank String workDate,
    @NotBlank String status,
    String notes
) {
}
