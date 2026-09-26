package com.revolt.showroom.service;

import com.revolt.showroom.dto.AttendanceResponse;
import com.revolt.showroom.dto.AttendanceUpsertRequest;
import com.revolt.showroom.entity.Admin;
import com.revolt.showroom.entity.Attendance;
import com.revolt.showroom.entity.AttendanceStatus;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.repository.AdminRepository;
import com.revolt.showroom.repository.AttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AdminRepository adminRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, AdminRepository adminRepository) {
        this.attendanceRepository = attendanceRepository;
        this.adminRepository = adminRepository;
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> listByDate(String dateStr) {
        LocalDate date = parseDate(dateStr);
        Map<UUID, Attendance> byAdmin = new HashMap<>();
        for (Attendance a : attendanceRepository.findByWorkDate(date)) {
            byAdmin.put(a.getAdmin().getId(), a);
        }

        return adminRepository.findAll().stream()
            .map(admin -> {
                Attendance a = byAdmin.get(admin.getId());
                return new AttendanceResponse(
                    admin.getId(), admin.getName(), admin.getEmail(), date,
                    a != null ? a.getStatus().name() : null,
                    a != null ? a.getNotes() : null
                );
            })
            .toList();
    }

    @Transactional
    public AttendanceResponse upsert(AttendanceUpsertRequest request) {
        LocalDate date = parseDate(request.workDate());
        AttendanceStatus status;
        try {
            status = AttendanceStatus.valueOf(request.status());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("status must be one of PRESENT, ABSENT, LEAVE, HALF_DAY");
        }
        Admin admin = adminRepository.findById(request.adminId())
            .orElseThrow(() -> ApiException.notFound("Admin not found"));

        Attendance attendance = attendanceRepository.findByAdminIdAndWorkDate(admin.getId(), date)
            .orElseGet(() -> {
                Attendance a = new Attendance();
                a.setAdmin(admin);
                a.setWorkDate(date);
                return a;
            });
        attendance.setStatus(status);
        attendance.setNotes(request.notes());
        attendanceRepository.save(attendance);

        return new AttendanceResponse(admin.getId(), admin.getName(), admin.getEmail(), date, status.name(), attendance.getNotes());
    }

    private static LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw ApiException.badRequest("date must be in yyyy-MM-dd format");
        }
    }
}
