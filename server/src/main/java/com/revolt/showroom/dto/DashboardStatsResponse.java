package com.revolt.showroom.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsResponse(
    long totalBikes,
    long activeBikes,
    long featuredBikes,
    long totalEnquiries,
    long newEnquiries,
    long totalBookings,
    long pendingBookings,
    long totalSales,
    BigDecimal totalRevenue,
    List<DayCount> enquiriesByDay,
    List<TopBike> topBikes,
    List<BrandCount> brandSplit
) {
}
