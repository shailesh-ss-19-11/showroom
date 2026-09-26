package com.revolt.showroom.dto;

import java.util.UUID;

public record TopBike(UUID bikeId, String name, String brand, long count) {
}
