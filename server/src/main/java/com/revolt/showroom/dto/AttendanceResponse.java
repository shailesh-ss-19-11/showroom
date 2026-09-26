package com.revolt.showroom.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AttendanceResponse(UUID adminId, String name, String email, LocalDate workDate, String status, String notes) {
}
