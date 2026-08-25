package com.bapmeokja.api.user.repository;

import com.bapmeokja.api.user.domain.DeviceRegistration;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceRegistrationRepository extends JpaRepository<DeviceRegistration, Long> {
    Optional<DeviceRegistration> findByDeviceToken(String deviceToken);

    void deleteAllByUserId(Long userId);
}
