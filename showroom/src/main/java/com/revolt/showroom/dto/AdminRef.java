package com.revolt.showroom.dto;

import com.revolt.showroom.entity.Admin;

import java.util.UUID;

public record AdminRef(UUID id, String name, String email) {
    public static AdminRef from(Admin admin) {
        if (admin == null) return null;
        return new AdminRef(admin.getId(), admin.getName(), admin.getEmail());
    }
}
