package com.revolt.showroom.security;

import com.revolt.showroom.entity.AdminRole;

import java.util.UUID;

public record AdminPrincipal(UUID id, String name, String email, AdminRole role) {
}
