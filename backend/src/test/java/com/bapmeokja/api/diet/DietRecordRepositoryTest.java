package com.bapmeokja.api.diet;

import static org.assertj.core.api.Assertions.assertThat;

import com.bapmeokja.api.diet.domain.DietRecord;
import com.bapmeokja.api.diet.domain.DietRecordItem;
import com.bapmeokja.api.diet.domain.MealType;
import com.bapmeokja.api.diet.repository.DietRecordRepository;
import com.bapmeokja.api.user.domain.User;
import com.bapmeokja.api.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class DietRecordRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DietRecordRepository dietRecordRepository;

    @Test
    void readsOnlyTheOwnersRecordsWithinTheUtcPeriodWithItems() {
        User user = userRepository.save(User.create(
                "dietuser",
                "encoded-password",
                "diet@example.com",
                "식단사용자",
                "식단토마토",
                true,
                true
        ));
        Instant eatenAt = Instant.parse("2025-03-20T12:30:00Z");
        DietRecord record = new DietRecord("rec_test", user, null, MealType.LUNCH, eatenAt, null);
        record.addItem(new DietRecordItem(
                "food_001",
                "백미밥",
                BigDecimal.valueOf(200),
                BigDecimal.valueOf(300),
                BigDecimal.valueOf(66),
                BigDecimal.valueOf(5.2),
                BigDecimal.valueOf(0.6),
                BigDecimal.valueOf(4),
                BigDecimal.ZERO
        ));
        dietRecordRepository.saveAndFlush(record);

        var found = dietRecordRepository.findAllWithItemsInPeriod(
                user.getId(),
                eatenAt.truncatedTo(ChronoUnit.DAYS),
                eatenAt.truncatedTo(ChronoUnit.DAYS).plus(1, ChronoUnit.DAYS)
        );

        assertThat(found).hasSize(1);
        assertThat(found.get(0).getItems()).hasSize(1);
        assertThat(found.get(0).getTotalCalorie()).isEqualByComparingTo("300.00");
    }
}
