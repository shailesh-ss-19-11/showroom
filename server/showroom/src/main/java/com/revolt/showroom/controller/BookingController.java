package com.revolt.showroom.controller;

import com.revolt.showroom.dto.BookingCreateRequest;
import com.revolt.showroom.dto.BookingResponse;
import com.revolt.showroom.dto.StatusUpdateRequest;
import com.revolt.showroom.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingCreateRequest request) {
        return bookingService.create(request);
    }

    @GetMapping
    public List<BookingResponse> list(
        @RequestParam(required = false) UUID bikeId,
        @RequestParam(required = false) String status
    ) {
        return bookingService.list(bikeId, status);
    }

    @PatchMapping("/{id}/status")
    public BookingResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusUpdateRequest request) {
        return bookingService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        bookingService.delete(id);
    }
}
