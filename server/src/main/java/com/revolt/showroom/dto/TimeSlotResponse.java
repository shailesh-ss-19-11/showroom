package com.revolt.showroom.dto;

import java.time.Instant;
import java.util.UUID;

public record TimeSlotResponse(UUID id, Instant slotTime, int capacity, long booked, long remaining) {
}
