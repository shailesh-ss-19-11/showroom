package com.revolt.showroom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

public record TimeSlotCreateRequest(@NotBlank String slotTime, @Min(1) int capacity) {
}
