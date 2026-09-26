package com.revolt.showroom.service;

import com.revolt.showroom.dto.TimeSlotCreateRequest;
import com.revolt.showroom.dto.TimeSlotGenerateRequest;
import com.revolt.showroom.dto.TimeSlotResponse;
import com.revolt.showroom.entity.TimeSlot;
import com.revolt.showroom.exception.ApiException;
import com.revolt.showroom.repository.BookingRepository;
import com.revolt.showroom.repository.TimeSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class TimeSlotService {

    // The showroom operates on India Standard Time — admin-entered times/dates are local to this zone.
    private static final ZoneId SHOWROOM_ZONE = ZoneId.of("Asia/Kolkata");

    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;

    public TimeSlotService(TimeSlotRepository timeSlotRepository, BookingRepository bookingRepository) {
        this.timeSlotRepository = timeSlotRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> list(String fromStr, String toStr) {
        Instant from = parseDateStart(fromStr, LocalDate.now(SHOWROOM_ZONE));
        Instant to = parseDateEnd(toStr, LocalDate.now(SHOWROOM_ZONE).plusDays(30));

        List<TimeSlot> slots = timeSlotRepository.findBySlotTimeBetweenOrderBySlotTimeAsc(from, to);
        Map<UUID, Long> bookedCounts = new HashMap<>();
        for (Object[] row : bookingRepository.activeCountsBySlot()) {
            bookedCounts.put((UUID) row[0], ((Number) row[1]).longValue());
        }

        List<TimeSlotResponse> result = new ArrayList<>();
        for (TimeSlot slot : slots) {
            long booked = bookedCounts.getOrDefault(slot.getId(), 0L);
            result.add(new TimeSlotResponse(slot.getId(), slot.getSlotTime(), slot.getCapacity(), booked, Math.max(0, slot.getCapacity() - booked)));
        }
        return result;
    }

    @Transactional
    public TimeSlotResponse create(TimeSlotCreateRequest request) {
        Instant slotTime;
        try {
            slotTime = Instant.parse(request.slotTime());
        } catch (DateTimeParseException e) {
            throw ApiException.badRequest("slotTime must be a valid ISO date-time");
        }
        if (timeSlotRepository.findBySlotTime(slotTime).isPresent()) {
            throw ApiException.conflict("A slot already exists at this time");
        }
        TimeSlot slot = new TimeSlot();
        slot.setSlotTime(slotTime);
        slot.setCapacity(request.capacity());
        timeSlotRepository.save(slot);
        return new TimeSlotResponse(slot.getId(), slot.getSlotTime(), slot.getCapacity(), 0, slot.getCapacity());
    }

    @Transactional
    public int generate(TimeSlotGenerateRequest request) {
        LocalDate start;
        LocalDate end;
        try {
            start = LocalDate.parse(request.startDate());
            end = LocalDate.parse(request.endDate());
        } catch (DateTimeParseException e) {
            throw ApiException.badRequest("startDate and endDate must be valid dates (yyyy-MM-dd)");
        }
        if (end.isBefore(start)) {
            throw ApiException.badRequest("endDate must be on or after startDate");
        }

        List<LocalTime> times = new ArrayList<>();
        for (String t : request.times()) {
            try {
                times.add(LocalTime.parse(t));
            } catch (DateTimeParseException e) {
                throw ApiException.badRequest("Invalid time: " + t + " (expected HH:mm)");
            }
        }

        Set<Integer> daysOfWeek = request.daysOfWeek() == null || request.daysOfWeek().isEmpty()
            ? Set.of(1, 2, 3, 4, 5, 6, 7)
            : new HashSet<>(request.daysOfWeek());

        int created = 0;
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            if (!daysOfWeek.contains(date.getDayOfWeek().getValue())) continue;
            for (LocalTime time : times) {
                Instant slotTime = date.atTime(time).atZone(SHOWROOM_ZONE).toInstant();
                if (timeSlotRepository.findBySlotTime(slotTime).isPresent()) continue;
                TimeSlot slot = new TimeSlot();
                slot.setSlotTime(slotTime);
                slot.setCapacity(request.capacity());
                timeSlotRepository.save(slot);
                created++;
            }
        }
        return created;
    }

    @Transactional
    public void delete(UUID id) {
        if (!timeSlotRepository.existsById(id)) {
            throw ApiException.notFound("Time slot not found");
        }
        timeSlotRepository.deleteById(id);
    }

    private static Instant parseDateStart(String value, LocalDate fallback) {
        LocalDate date = value == null || value.isBlank() ? fallback : LocalDate.parse(value);
        return date.atStartOfDay(SHOWROOM_ZONE).toInstant();
    }

    private static Instant parseDateEnd(String value, LocalDate fallback) {
        LocalDate date = value == null || value.isBlank() ? fallback : LocalDate.parse(value);
        return date.plusDays(1).atStartOfDay(SHOWROOM_ZONE).toInstant();
    }
}
