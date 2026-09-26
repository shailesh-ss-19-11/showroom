package com.revolt.showroom.dto;

import com.revolt.showroom.entity.PaymentStatus;
import com.revolt.showroom.entity.Sale;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SaleResponse(
    UUID id,
    BikeSummary bike,
    String customerName,
    String customerPhone,
    String customerEmail,
    BigDecimal salePrice,
    PaymentStatus paymentStatus,
    Instant saleDate,
    String invoiceNumber,
    String notes,
    UUID enquiryId,
    UUID bookingId,
    AdminRef soldBy,
    Instant createdAt
) {
    public static SaleResponse from(Sale sale) {
        return new SaleResponse(
            sale.getId(),
            BikeSummary.from(sale.getBike()),
            sale.getCustomerName(),
            sale.getCustomerPhone(),
            sale.getCustomerEmail(),
            sale.getSalePrice(),
            sale.getPaymentStatus(),
            sale.getSaleDate(),
            sale.getInvoiceNumber(),
            sale.getNotes(),
            sale.getEnquiry() != null ? sale.getEnquiry().getId() : null,
            sale.getBooking() != null ? sale.getBooking().getId() : null,
            AdminRef.from(sale.getSoldBy()),
            sale.getCreatedAt()
        );
    }
}
