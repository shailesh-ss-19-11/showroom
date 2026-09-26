package com.revolt.showroom.dto;

import com.revolt.showroom.entity.BikeColor;

import java.util.UUID;

public record BikeColorResponse(UUID id, String name, String hexCode) {
    public static BikeColorResponse from(BikeColor color) {
        return new BikeColorResponse(color.getId(), color.getName(), color.getHexCode());
    }
}
