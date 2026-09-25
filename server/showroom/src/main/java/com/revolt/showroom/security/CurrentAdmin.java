package com.revolt.showroom.security;

import com.revolt.showroom.entity.AdminRole;
import com.revolt.showroom.exception.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class CurrentAdmin {

    private CurrentAdmin() {
    }

    public static Optional<AdminPrincipal> get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AdminPrincipal principal)) {
            return Optional.empty();
        }
        return Optional.of(principal);
    }

    public static AdminPrincipal require() {
        return get().orElseThrow(() -> ApiException.unauthorized("Missing authentication token"));
    }

    public static AdminPrincipal requireOwner() {
        AdminPrincipal admin = require();
        if (admin.role() != AdminRole.OWNER) {
            throw ApiException.forbidden("Only owners can perform this action");
        }
        return admin;
    }
}
