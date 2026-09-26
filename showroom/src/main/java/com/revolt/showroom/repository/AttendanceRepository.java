package com.revolt.showroom.repository;

import com.revolt.showroom.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findByWorkDate(LocalDate workDate);
    Optional<Attendance> findByAdminIdAndWorkDate(UUID adminId, LocalDate workDate);
}
