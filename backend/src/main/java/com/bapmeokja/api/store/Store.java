package com.bapmeokja.api.store;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "stores", indexes = @Index(name = "idx_stores_location", columnList = "lat,lng"))
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Store {
    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 300)
    private String address;

    @Column(nullable = false)
    private double lat;

    @Column(nullable = false)
    private double lng;

    public Store(String id, String name, String address, double lat, double lng) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.lng = lng;
    }
}
