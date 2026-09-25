package com.revolt.showroom.dto;

import com.revolt.showroom.entity.Bike;

import java.util.UUID;

public record BikeSummary(UUID id, String name, String brand) {
    public static BikeSummary from(Bike bike) {
        if (bike == null) return null;
        return new BikeSummary(bike.getId(), bike.getName(), bike.getBrand());
    }
}
