package com.revolt.showroom.controller;

import com.revolt.showroom.dto.LoginRequest;
import com.revolt.showroom.dto.LoginResponse;
import com.revolt.showroom.dto.MeResponse;
import com.revolt.showroom.security.CurrentAdmin;
import com.revolt.showroom.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public MeResponse me() {
        return new MeResponse(authService.me(CurrentAdmin.require().id()));
    }
}
