package com.revolt.showroom.repository;

import com.revolt.showroom.entity.Bike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface BikeRepository extends JpaRepository<Bike, UUID>, JpaSpecificationExecutor<Bike> {
    List<Bike> findByIsActiveTrue();
}
