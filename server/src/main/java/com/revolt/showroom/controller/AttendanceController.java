package com.revolt.showroom.controller;

import com.revolt.showroom.dto.AttendanceResponse;
import com.revolt.showroom.dto.AttendanceUpsertRequest;
import com.revolt.showroom.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<AttendanceResponse> list(@RequestParam String date) {
        return attendanceService.listByDate(date);
    }

    @PutMapping
    public AttendanceResponse upsert(@Valid @RequestBody AttendanceUpsertRequest request) {
        return attendanceService.upsert(request);
    }
}
