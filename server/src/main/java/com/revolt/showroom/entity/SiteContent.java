package com.revolt.showroom.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "site_content")
@Getter
@Setter
public class SiteContent {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "hero_eyebrow")
    private String heroEyebrow;

    @Column(name = "hero_heading_line1")
    private String heroHeadingLine1;

    @Column(name = "hero_heading_line2")
    private String heroHeadingLine2;

    @Column(name = "hero_heading_line3")
    private String heroHeadingLine3;

    @Column(name = "hero_subtext", columnDefinition = "text")
    private String heroSubtext;

    @Column(name = "hero_image_url", length = 1024)
    private String heroImageUrl;

    @Column(name = "stat1_value")
    private String stat1Value;

    @Column(name = "stat1_label")
    private String stat1Label;

    @Column(name = "stat2_value")
    private String stat2Value;

    @Column(name = "stat2_label")
    private String stat2Label;

    @Column(name = "stat3_value")
    private String stat3Value;

    @Column(name = "stat3_label")
    private String stat3Label;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
