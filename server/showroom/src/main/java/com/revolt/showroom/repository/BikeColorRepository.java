package com.revolt.showroom.repository;

import com.revolt.showroom.entity.BikeColor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BikeColorRepository extends JpaRepository<BikeColor, UUID> {
}
