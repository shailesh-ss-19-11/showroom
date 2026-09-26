package com.revolt.showroom.controller;

import com.revolt.showroom.dto.AdminRef;
import com.revolt.showroom.repository.AdminRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * A lightweight, any-admin-readable staff list for assignment pickers — distinct from
 * /api/admins, which is owner-only and exposes full account-management actions.
 */
@RestController
@RequestMapping("/api/staff-directory")
public class StaffDirectoryController {

    private final AdminRepository adminRepository;

    public StaffDirectoryController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @GetMapping
    public List<AdminRef> list() {
        return adminRepository.findAll().stream().map(AdminRef::from).toList();
    }
}
