package com.revolt.showroom.dto;

import java.util.List;

public record DashboardStatsResponse(
    long totalBikes,
    long activeBikes,
    long featuredBikes,
    long totalEnquiries,
    long newEnquiries,
    long totalBookings,
    long pendingBookings,
    List<DayCount> enquiriesByDay,
    List<TopBike> topBikes,
    List<BrandCount> brandSplit
) {
}
