package com.revolt.showroom.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "time_slot")
@Getter
@Setter
public class TimeSlot {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "slot_time", nullable = false, unique = true)
    private Instant slotTime;

    @Column(nullable = false)
    private int capacity = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
