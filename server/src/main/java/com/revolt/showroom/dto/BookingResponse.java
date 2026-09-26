package com.revolt.showroom.dto;

import com.revolt.showroom.entity.Booking;
import com.revolt.showroom.entity.BookingStatus;

import java.time.Instant;
import java.util.UUID;

public record BookingResponse(
    UUID id,
    String name,
    String phone,
    String email,
    Instant preferredDate,
    String notes,
    BikeSummary bike,
    BookingStatus status,
    AdminRef assignedTo,
    Instant createdAt
) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getName(),
            booking.getPhone(),
            booking.getEmail(),
            booking.getPreferredDate(),
            booking.getNotes(),
            BikeSummary.from(booking.getBike()),
            booking.getStatus(),
            AdminRef.from(booking.getAssignedTo()),
            booking.getCreatedAt()
        );
    }
}
