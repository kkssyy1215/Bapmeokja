package com.bapmeokja.api.store;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class NearbyStoreServiceTest {

    @Test
    void calculatesDistanceInMetersWithHaversineFormula() {
        double distance = NearbyStoreService.distanceMeters(
                37.4979,
                127.0276,
                37.5000,
                127.0300
        );

        assertThat(distance).isBetween(300.0, 330.0);
    }
}
