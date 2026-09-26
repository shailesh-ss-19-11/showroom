package com.revolt.showroom.repository;

import com.revolt.showroom.entity.SiteContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SiteContentRepository extends JpaRepository<SiteContent, UUID> {
}
