package com.revolt.showroom.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record StaffPerformance(
    UUID adminId,
    String name,
    String email,
    long enquiriesAssigned,
    long enquiriesConverted,
    long bookingsAssigned,
    long bookingsCompleted,
    long salesCount,
    BigDecimal revenue
) {
}
