package com.revolt.showroom.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "bike_color")
@Getter
@Setter
public class BikeColor {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bike_id", nullable = false)
    @JsonIgnore
    private Bike bike;

    @Column(nullable = false)
    private String name;

    @Column(name = "hex_code", nullable = false)
    private String hexCode;
}
