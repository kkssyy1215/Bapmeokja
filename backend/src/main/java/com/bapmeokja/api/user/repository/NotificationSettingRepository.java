package com.bapmeokja.api.user.repository;

import com.bapmeokja.api.user.domain.NotificationSetting;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {
    Optional<NotificationSetting> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
