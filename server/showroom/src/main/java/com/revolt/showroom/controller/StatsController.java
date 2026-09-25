package com.revolt.showroom.controller;

import com.revolt.showroom.dto.DashboardStatsResponse;
import com.revolt.showroom.service.StatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/dashboard")
    public DashboardStatsResponse dashboard() {
        return statsService.dashboard();
    }
}
