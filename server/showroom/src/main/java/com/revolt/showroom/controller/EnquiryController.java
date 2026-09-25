package com.revolt.showroom.controller;

import com.revolt.showroom.dto.EnquiryCreateRequest;
import com.revolt.showroom.dto.EnquiryResponse;
import com.revolt.showroom.dto.StatusUpdateRequest;
import com.revolt.showroom.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EnquiryResponse create(@Valid @RequestBody EnquiryCreateRequest request) {
        return enquiryService.create(request);
    }

    @GetMapping("/export")
    public ResponseEntity<String> export(
        @RequestParam(required = false) UUID bikeId,
        @RequestParam(required = false) String status
    ) {
        String csv = enquiryService.exportCsv(bikeId, status);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("text/csv"))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"enquiries-" + System.currentTimeMillis() + ".csv\"")
            .body(csv);
    }

    @GetMapping
    public List<EnquiryResponse> list(
        @RequestParam(required = false) UUID bikeId,
        @RequestParam(required = false) String status
    ) {
        return enquiryService.list(bikeId, status);
    }

    @PatchMapping("/{id}/status")
    public EnquiryResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusUpdateRequest request) {
        return enquiryService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        enquiryService.delete(id);
    }
}
