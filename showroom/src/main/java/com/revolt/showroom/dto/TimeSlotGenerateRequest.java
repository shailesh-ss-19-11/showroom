package com.revolt.showroom.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record TimeSlotGenerateRequest(
    @NotBlank String startDate,
    @NotBlank String endDate,
    @NotEmpty List<String> times,
    @Min(1) int capacity,
    List<Integer> daysOfWeek
) {
}
