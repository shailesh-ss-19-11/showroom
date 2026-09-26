package com.revolt.showroom.config;

import com.revolt.showroom.entity.*;
import com.revolt.showroom.repository.AdminRepository;
import com.revolt.showroom.repository.BikeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final BikeRepository bikeRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    public DataSeeder(AdminRepository adminRepository, BikeRepository bikeRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.bikeRepository = bikeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedBike();
    }

    private void seedAdmin() {
        if (adminRepository.count() > 0) return;

        Admin admin = new Admin();
        admin.setName(adminName);
        admin.setEmail(adminEmail.toLowerCase().trim());
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(AdminRole.OWNER);
        adminRepository.save(admin);
        System.out.println("Created owner admin " + admin.getEmail());
    }

    private void seedBike() {
        if (bikeRepository.count() > 0) return;

        Bike bike = new Bike();
        bike.setName("RV400");
        bike.setBrand("Revolt");
        bike.setCategory("Sport");
        bike.setPrice(new BigDecimal("128900"));
        bike.setBatteryCapacityKwh(3.24);
        bike.setRangeKm(150.0);
        bike.setChargingTimeHours(4.5);
        bike.setTopSpeedKmph(85.0);
        bike.setPower("3 kW BLDC motor");
        bike.setDescription("An AI-enabled electric motorcycle with swappable battery and app-based customization.");
        bike.setFeatured(true);

        BikeColor black = new BikeColor();
        black.setBike(bike);
        black.setName("Metallic Black");
        black.setHexCode("#1a1a1a");
        bike.getColors().add(black);

        BikeColor blue = new BikeColor();
        blue.setBike(bike);
        blue.setName("Racing Blue");
        blue.setHexCode("#1e3a8a");
        bike.getColors().add(blue);

        bikeRepository.save(bike);
        System.out.println("Created sample bike " + bike.getName());
    }
}
