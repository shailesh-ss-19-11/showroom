package com.revolt.showroom.service;

import com.revolt.showroom.dto.BookingCreateRequest;
import com.revolt.showroom.dto.BookingResponse;
import com.revolt.showroom.entity.Booking;
import com.revolt.showroom.entity.BookingStatus;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.repository.BikeRepository;
import com.revolt.showroom.repository.BookingRepository;
import com.revolt.showroom.spec.BookingSpecifications;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BikeRepository bikeRepository;

    public BookingService(BookingRepository bookingRepository, BikeRepository bikeRepository) {
        this.bookingRepository = bookingRepository;
        this.bikeRepository = bikeRepository;
    }

    @Transactional
    public BookingResponse create(BookingCreateRequest request) {
        if (isBlank(request.name()) || isBlank(request.phone()) || isBlank(request.preferredDate())) {
            throw ApiException.badRequest("name, phone and preferredDate are required");
        }

        Instant preferredDate;
        try {
            preferredDate = Instant.parse(request.preferredDate());
        } catch (DateTimeParseException e) {
            throw ApiException.badRequest("preferredDate must be a valid date");
        }

        Booking booking = new Booking();
        booking.setName(request.name());
        booking.setPhone(request.phone());
        booking.setEmail(request.email());
        booking.setPreferredDate(preferredDate);
        booking.setNotes(request.notes());
        if (request.bikeId() != null) {
            bikeRepository.findById(request.bikeId()).ifPresent(booking::setBike);
        }

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> list(UUID bikeId, String status) {
        BookingStatus parsed = parseStatus(status);
        return bookingRepository
            .findAll(BookingSpecifications.filter(bikeId, parsed), Sort.by(Sort.Direction.ASC, "preferredDate"))
            .stream()
            .map(BookingResponse::from)
            .toList();
    }

    @Transactional
    public BookingResponse updateStatus(UUID id, String status) {
        BookingStatus parsed;
        try {
            parsed = BookingStatus.valueOf(status);
        } catch (Exception e) {
            throw ApiException.badRequest("status must be one of PENDING, CONFIRMED, COMPLETED, CANCELLED");
        }
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> ApiException.notFound("Booking not found"));
        booking.setStatus(parsed);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public void delete(UUID id) {
        if (!bookingRepository.existsById(id)) {
            throw ApiException.notFound("Booking not found");
        }
        bookingRepository.deleteById(id);
    }

    private static BookingStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return BookingStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
