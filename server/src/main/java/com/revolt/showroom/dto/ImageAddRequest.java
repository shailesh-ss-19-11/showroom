package com.revolt.showroom.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record ImageAddRequest(@NotBlank String url, UUID colorId, Boolean isPrimary) {
}
