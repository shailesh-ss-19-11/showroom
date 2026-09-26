package com.revolt.showroom.controller;

import com.revolt.showroom.dto.DashboardStatsResponse;
import com.revolt.showroom.dto.StaffPerformance;
import com.revolt.showroom.service.StatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    @GetMapping("/staff")
    public List<StaffPerformance> staffPerformance() {
        return statsService.staffPerformance();
    }
}
