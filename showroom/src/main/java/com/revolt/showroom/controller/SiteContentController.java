package com.revolt.showroom.controller;

import com.revolt.showroom.dto.SiteContentRequest;
import com.revolt.showroom.dto.SiteContentResponse;
import com.revolt.showroom.service.SiteContentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site-content")
public class SiteContentController {

    private final SiteContentService siteContentService;

    public SiteContentController(SiteContentService siteContentService) {
        this.siteContentService = siteContentService;
    }

    @GetMapping
    public SiteContentResponse get() {
        return siteContentService.get();
    }

    @PutMapping
    public SiteContentResponse update(@RequestBody SiteContentRequest request) {
        return siteContentService.update(request);
    }
}
