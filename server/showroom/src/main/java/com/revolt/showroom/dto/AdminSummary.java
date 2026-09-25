package com.revolt.showroom.dto;

import com.revolt.showroom.entity.Admin;
import com.revolt.showroom.entity.AdminRole;

import java.time.Instant;
import java.util.UUID;

public record AdminSummary(UUID id, String name, String email, AdminRole role, Instant createdAt) {
    public static AdminSummary from(Admin admin) {
        return new AdminSummary(admin.getId(), admin.getName(), admin.getEmail(), admin.getRole(), admin.getCreatedAt());
    }
}
