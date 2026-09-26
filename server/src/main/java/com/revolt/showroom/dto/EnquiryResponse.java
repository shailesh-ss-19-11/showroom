package com.revolt.showroom.dto;

import com.revolt.showroom.entity.Enquiry;
import com.revolt.showroom.entity.EnquiryStatus;

import java.time.Instant;
import java.util.UUID;

public record EnquiryResponse(
    UUID id,
    String name,
    String phone,
    String email,
    String message,
    BikeSummary bike,
    String source,
    EnquiryStatus status,
    AdminRef assignedTo,
    Instant createdAt
) {
    public static EnquiryResponse from(Enquiry enquiry) {
        return new EnquiryResponse(
            enquiry.getId(),
            enquiry.getName(),
            enquiry.getPhone(),
            enquiry.getEmail(),
            enquiry.getMessage(),
            BikeSummary.from(enquiry.getBike()),
            enquiry.getSource(),
            enquiry.getStatus(),
            AdminRef.from(enquiry.getAssignedTo()),
            enquiry.getCreatedAt()
        );
    }
}
