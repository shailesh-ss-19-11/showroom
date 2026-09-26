package com.revolt.showroom.repository;

import com.revolt.showroom.entity.BikeImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BikeImageRepository extends JpaRepository<BikeImage, UUID> {
    long countByBikeId(UUID bikeId);
    List<BikeImage> findByIdInAndBikeId(List<UUID> ids, UUID bikeId);
}
