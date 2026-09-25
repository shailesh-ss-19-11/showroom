package com.revolt.showroom.service;

import com.revolt.showroom.dto.AdminSummary;
import com.revolt.showroom.dto.LoginRequest;
import com.revolt.showroom.dto.LoginResponse;
import com.revolt.showroom.entity.Admin;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.repository.AdminRepository;
import com.revolt.showroom.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.email().toLowerCase().trim())
            .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        String token = jwtService.generateToken(admin);
        return new LoginResponse(token, AdminSummary.from(admin));
    }

    public AdminSummary me(UUID adminId) {
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> ApiException.notFound("Admin not found"));
        return AdminSummary.from(admin);
    }
}
