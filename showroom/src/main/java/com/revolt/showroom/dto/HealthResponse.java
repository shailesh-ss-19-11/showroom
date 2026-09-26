package com.revolt.showroom.dto;

public record HealthResponse(String status, long uptimeSeconds, String timestamp, String db, String storage) {
}
