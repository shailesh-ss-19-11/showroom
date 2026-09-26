package com.revolt.showroom.repository;

import com.revolt.showroom.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {
    List<TimeSlot> findBySlotTimeBetweenOrderBySlotTimeAsc(Instant from, Instant to);
    Optional<TimeSlot> findBySlotTime(Instant slotTime);
}
