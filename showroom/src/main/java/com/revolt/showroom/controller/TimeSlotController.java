package com.revolt.showroom.controller;

import com.revolt.showroom.dto.TimeSlotCreateRequest;
import com.revolt.showroom.dto.TimeSlotGenerateRequest;
import com.revolt.showroom.dto.TimeSlotResponse;
import com.revolt.showroom.service.TimeSlotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/time-slots")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    public TimeSlotController(TimeSlotService timeSlotService) {
        this.timeSlotService = timeSlotService;
    }

    @GetMapping
    public List<TimeSlotResponse> list(
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to
    ) {
        return timeSlotService.list(from, to);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TimeSlotResponse create(@Valid @RequestBody TimeSlotCreateRequest request) {
        return timeSlotService.create(request);
    }

    @PostMapping("/generate")
    public Map<String, Integer> generate(@Valid @RequestBody TimeSlotGenerateRequest request) {
        return Map.of("created", timeSlotService.generate(request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        timeSlotService.delete(id);
    }
}
