package com.revolt.showroom.dto;

import jakarta.validation.constraints.NotBlank;

public record ColorRequest(@NotBlank String name, @NotBlank String hexCode) {
}
