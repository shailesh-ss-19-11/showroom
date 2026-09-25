package com.revolt.showroom.repository;

import com.revolt.showroom.entity.Booking;
import com.revolt.showroom.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID>, JpaSpecificationExecutor<Booking> {
    long countByStatus(BookingStatus status);
}
