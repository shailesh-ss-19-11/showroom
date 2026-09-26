package com.revolt.showroom.controller;

import com.revolt.showroom.dto.SaleCreateRequest;
import com.revolt.showroom.dto.SaleResponse;
import com.revolt.showroom.dto.StatusUpdateRequest;
import com.revolt.showroom.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public List<SaleResponse> list() {
        return saleService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SaleResponse create(@Valid @RequestBody SaleCreateRequest request) {
        return saleService.create(request);
    }

    @PatchMapping("/{id}/payment-status")
    public SaleResponse updatePaymentStatus(@PathVariable UUID id, @Valid @RequestBody StatusUpdateRequest request) {
        return saleService.updatePaymentStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        saleService.delete(id);
    }
}
