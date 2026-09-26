package com.revolt.showroom.controller;

import com.revolt.showroom.dto.AdminSummary;
import com.revolt.showroom.dto.CreateAdminRequest;
import com.revolt.showroom.dto.RoleUpdateRequest;
import com.revolt.showroom.security.CurrentAdmin;
import com.revolt.showroom.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public List<AdminSummary> list() {
        return adminService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminSummary create(@Valid @RequestBody CreateAdminRequest request) {
        return adminService.create(request);
    }

    @PatchMapping("/{id}/role")
    public AdminSummary updateRole(@PathVariable UUID id, @Valid @RequestBody RoleUpdateRequest request) {
        return adminService.updateRole(id, request.role(), CurrentAdmin.require());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        adminService.delete(id, CurrentAdmin.require());
    }
}
