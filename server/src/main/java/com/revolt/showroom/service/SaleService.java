package com.revolt.showroom.service;

import com.revolt.showroom.dto.SaleCreateRequest;
import com.revolt.showroom.dto.SaleResponse;
import com.revolt.showroom.entity.*;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final BikeRepository bikeRepository;
    private final EnquiryRepository enquiryRepository;
    private final BookingRepository bookingRepository;
    private final AdminRepository adminRepository;

    public SaleService(
        SaleRepository saleRepository,
        BikeRepository bikeRepository,
        EnquiryRepository enquiryRepository,
        BookingRepository bookingRepository,
        AdminRepository adminRepository
    ) {
        this.saleRepository = saleRepository;
        this.bikeRepository = bikeRepository;
        this.enquiryRepository = enquiryRepository;
        this.bookingRepository = bookingRepository;
        this.adminRepository = adminRepository;
    }

    @Transactional(readOnly = true)
    public List<SaleResponse> list() {
        return saleRepository.findAll(Sort.by(Sort.Direction.DESC, "saleDate"))
            .stream().map(SaleResponse::from).toList();
    }

    @Transactional
    public SaleResponse create(SaleCreateRequest request) {
        Sale sale = new Sale();
        if (request.bikeId() != null) {
            bikeRepository.findById(request.bikeId()).ifPresent(sale::setBike);
        }
        sale.setCustomerName(request.customerName());
        sale.setCustomerPhone(request.customerPhone());
        sale.setCustomerEmail(request.customerEmail());
        sale.setSalePrice(request.salePrice());
        if (request.paymentStatus() != null) {
            try {
                sale.setPaymentStatus(PaymentStatus.valueOf(request.paymentStatus()));
            } catch (IllegalArgumentException e) {
                throw ApiException.badRequest("paymentStatus must be one of PENDING, PARTIAL, PAID, REFUNDED");
            }
        }
        sale.setNotes(request.notes());
        sale.setInvoiceNumber(generateInvoiceNumber());

        if (request.enquiryId() != null) {
            enquiryRepository.findById(request.enquiryId()).ifPresent(sale::setEnquiry);
        }
        if (request.bookingId() != null) {
            bookingRepository.findById(request.bookingId()).ifPresent(sale::setBooking);
        }
        if (request.soldById() != null) {
            adminRepository.findById(request.soldById()).ifPresent(sale::setSoldBy);
        }

        return SaleResponse.from(saleRepository.save(sale));
    }

    @Transactional
    public SaleResponse updatePaymentStatus(UUID id, String status) {
        PaymentStatus parsed;
        try {
            parsed = PaymentStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("status must be one of PENDING, PARTIAL, PAID, REFUNDED");
        }
        Sale sale = saleRepository.findById(id).orElseThrow(() -> ApiException.notFound("Sale not found"));
        sale.setPaymentStatus(parsed);
        return SaleResponse.from(saleRepository.save(sale));
    }

    @Transactional
    public void delete(UUID id) {
        if (!saleRepository.existsById(id)) {
            throw ApiException.notFound("Sale not found");
        }
        saleRepository.deleteById(id);
    }

    private String generateInvoiceNumber() {
        byte[] random = new byte[4];
        new java.security.SecureRandom().nextBytes(random);
        return "INV-" + HexFormat.of().withUpperCase().formatHex(random);
    }
}
