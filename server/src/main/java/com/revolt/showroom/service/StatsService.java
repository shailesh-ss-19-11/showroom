package com.revolt.showroom.service;

import com.revolt.showroom.dto.*;
import com.revolt.showroom.entity.Admin;
import com.revolt.showroom.entity.Bike;
import com.revolt.showroom.entity.BookingStatus;
import com.revolt.showroom.entity.EnquiryStatus;
import com.revolt.showroom.repository.AdminRepository;
import com.revolt.showroom.repository.BikeRepository;
import com.revolt.showroom.repository.BookingRepository;
import com.revolt.showroom.repository.EnquiryRepository;
import com.revolt.showroom.repository.SaleRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class StatsService {

    private static final int DAYS = 14;

    private final BikeRepository bikeRepository;
    private final EnquiryRepository enquiryRepository;
    private final BookingRepository bookingRepository;
    private final SaleRepository saleRepository;
    private final AdminRepository adminRepository;

    public StatsService(
        BikeRepository bikeRepository,
        EnquiryRepository enquiryRepository,
        BookingRepository bookingRepository,
        SaleRepository saleRepository,
        AdminRepository adminRepository
    ) {
        this.bikeRepository = bikeRepository;
        this.enquiryRepository = enquiryRepository;
        this.bookingRepository = bookingRepository;
        this.saleRepository = saleRepository;
        this.adminRepository = adminRepository;
    }

    public DashboardStatsResponse dashboard() {
        long totalBikes = bikeRepository.count();
        long activeBikes = bikeRepository.findByIsActiveTrue().size();
        long featuredBikes = bikeRepository.findAll().stream().filter(Bike::isFeatured).count();
        long totalEnquiries = enquiryRepository.count();
        long newEnquiries = enquiryRepository.countByStatus(EnquiryStatus.NEW);
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long totalSales = saleRepository.count();
        BigDecimal totalRevenue = saleRepository.totalRevenue();

        List<DayCount> enquiriesByDay = enquiriesByDay();
        List<TopBike> topBikes = topBikes();
        List<BrandCount> brandSplit = brandSplit();

        return new DashboardStatsResponse(
            totalBikes, activeBikes, featuredBikes,
            totalEnquiries, newEnquiries, totalBookings, pendingBookings,
            totalSales, totalRevenue,
            enquiriesByDay, topBikes, brandSplit
        );
    }

    public List<StaffPerformance> staffPerformance() {
        Map<UUID, long[]> enquiryStats = new HashMap<>();
        for (Object[] row : enquiryRepository.assignmentStatsByStaff()) {
            enquiryStats.put((UUID) row[0], new long[]{((Number) row[1]).longValue(), ((Number) row[2]).longValue()});
        }
        Map<UUID, long[]> bookingStats = new HashMap<>();
        for (Object[] row : bookingRepository.assignmentStatsByStaff()) {
            bookingStats.put((UUID) row[0], new long[]{((Number) row[1]).longValue(), ((Number) row[2]).longValue()});
        }
        Map<UUID, Object[]> saleStats = new HashMap<>();
        for (Object[] row : saleRepository.revenueByStaff()) {
            saleStats.put((UUID) row[0], new Object[]{((Number) row[1]).longValue(), row[2]});
        }

        List<StaffPerformance> result = new ArrayList<>();
        for (Admin admin : adminRepository.findAll()) {
            long[] e = enquiryStats.getOrDefault(admin.getId(), new long[]{0, 0});
            long[] b = bookingStats.getOrDefault(admin.getId(), new long[]{0, 0});
            Object[] s = saleStats.getOrDefault(admin.getId(), new Object[]{0L, BigDecimal.ZERO});
            result.add(new StaffPerformance(
                admin.getId(), admin.getName(), admin.getEmail(),
                e[0], e[1], b[0], b[1],
                (long) s[0], (BigDecimal) s[1]
            ));
        }
        return result;
    }

    private List<DayCount> enquiriesByDay() {
        Instant since = LocalDate.now(ZoneOffset.UTC).minusDays(DAYS - 1L).atStartOfDay(ZoneOffset.UTC).toInstant();
        Map<String, Long> countByDay = new HashMap<>();
        for (Object[] row : enquiryRepository.countByDaySince(since)) {
            String day = row[0].toString(); // java.sql.Date#toString() -> yyyy-MM-dd
            long count = ((Number) row[1]).longValue();
            countByDay.put(day, count);
        }

        List<DayCount> result = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        for (int i = DAYS - 1; i >= 0; i--) {
            String date = LocalDate.now(ZoneOffset.UTC).minusDays(i).format(fmt);
            result.add(new DayCount(date, countByDay.getOrDefault(date, 0L)));
        }
        return result;
    }

    private List<TopBike> topBikes() {
        List<Object[]> rows = enquiryRepository.topBikeCounts(PageRequest.of(0, 5));
        List<TopBike> result = new ArrayList<>();
        for (Object[] row : rows) {
            UUID bikeId = (UUID) row[0];
            long count = ((Number) row[1]).longValue();
            Bike bike = bikeRepository.findById(bikeId).orElse(null);
            result.add(new TopBike(
                bikeId,
                bike != null ? bike.getName() : "Unknown",
                bike != null ? bike.getBrand() : "",
                count
            ));
        }
        return result;
    }

    private List<BrandCount> brandSplit() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Bike bike : bikeRepository.findAll()) {
            counts.merge(bike.getBrand(), 1L, Long::sum);
        }
        return counts.entrySet().stream()
            .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
            .map(e -> new BrandCount(e.getKey(), e.getValue()))
            .toList();
    }
}
