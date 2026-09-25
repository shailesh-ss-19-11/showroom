package com.revolt.showroom.service;

import com.revolt.showroom.dto.*;
import com.revolt.showroom.entity.Bike;
import com.revolt.showroom.entity.BookingStatus;
import com.revolt.showroom.entity.EnquiryStatus;
import com.revolt.showroom.repository.BikeRepository;
import com.revolt.showroom.repository.BookingRepository;
import com.revolt.showroom.repository.EnquiryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

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

    public StatsService(BikeRepository bikeRepository, EnquiryRepository enquiryRepository, BookingRepository bookingRepository) {
        this.bikeRepository = bikeRepository;
        this.enquiryRepository = enquiryRepository;
        this.bookingRepository = bookingRepository;
    }

    public DashboardStatsResponse dashboard() {
        long totalBikes = bikeRepository.count();
        long activeBikes = bikeRepository.findByIsActiveTrue().size();
        long featuredBikes = bikeRepository.findAll().stream().filter(Bike::isFeatured).count();
        long totalEnquiries = enquiryRepository.count();
        long newEnquiries = enquiryRepository.countByStatus(EnquiryStatus.NEW);
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);

        List<DayCount> enquiriesByDay = enquiriesByDay();
        List<TopBike> topBikes = topBikes();
        List<BrandCount> brandSplit = brandSplit();

        return new DashboardStatsResponse(
            totalBikes, activeBikes, featuredBikes,
            totalEnquiries, newEnquiries, totalBookings, pendingBookings,
            enquiriesByDay, topBikes, brandSplit
        );
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
