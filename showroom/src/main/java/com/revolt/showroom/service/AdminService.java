package com.revolt.showroom.service;

import com.revolt.showroom.dto.AdminSummary;
import com.revolt.showroom.dto.CreateAdminRequest;
import com.revolt.showroom.entity.Admin;
import com.revolt.showroom.entity.AdminRole;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.repository.AdminRepository;
import com.revolt.showroom.security.AdminPrincipal;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AdminSummary> list() {
        return adminRepository.findAll().stream()
            .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
            .map(AdminSummary::from)
            .toList();
    }

    @Transactional
    public AdminSummary create(CreateAdminRequest request) {
        if (request.password().length() < 8) {
            throw ApiException.badRequest("Password must be at least 8 characters");
        }

        Admin admin = new Admin();
        admin.setName(request.name());
        admin.setEmail(request.email().toLowerCase().trim());
        admin.setPassword(passwordEncoder.encode(request.password()));
        admin.setRole("OWNER".equalsIgnoreCase(request.role()) ? AdminRole.OWNER : AdminRole.STAFF);

        try {
            return AdminSummary.from(adminRepository.save(admin));
        } catch (DataIntegrityViolationException e) {
            throw ApiException.conflict("An admin with this email already exists");
        }
    }

    @Transactional
    public AdminSummary updateRole(UUID id, String roleValue, AdminPrincipal actingAdmin) {
        AdminRole role;
        try {
            role = AdminRole.valueOf(roleValue);
        } catch (Exception e) {
            throw ApiException.badRequest("role must be OWNER or STAFF");
        }

        if (id.equals(actingAdmin.id()) && role != AdminRole.OWNER) {
            throw ApiException.badRequest("You cannot demote yourself");
        }

        Admin admin = adminRepository.findById(id).orElseThrow(() -> ApiException.notFound("Admin not found"));
        admin.setRole(role);
        return AdminSummary.from(adminRepository.save(admin));
    }

    @Transactional
    public void delete(UUID id, AdminPrincipal actingAdmin) {
        if (id.equals(actingAdmin.id())) {
            throw ApiException.badRequest("You cannot delete your own account");
        }
        if (!adminRepository.existsById(id)) {
            throw ApiException.notFound("Admin not found");
        }
        adminRepository.deleteById(id);
    }
}
