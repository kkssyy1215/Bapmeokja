package com.bapmeokja.api.diet.repository;

import com.bapmeokja.api.diet.domain.DietRecord;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DietRecordRepository extends JpaRepository<DietRecord, String> {

    @Query("""
            select distinct record
            from DietRecord record
            left join fetch record.items
            where record.user.id = :userId
              and record.eatenAt >= :startInclusive
              and record.eatenAt < :endExclusive
            order by record.eatenAt asc
            """)
    List<DietRecord> findAllWithItemsInPeriod(
            @Param("userId") Long userId,
            @Param("startInclusive") Instant startInclusive,
            @Param("endExclusive") Instant endExclusive
    );

    @Query("""
            select distinct record
            from DietRecord record
            left join fetch record.items
            where record.id = :recordId and record.user.id = :userId
            """)
    Optional<DietRecord> findOwnedWithItems(
            @Param("recordId") String recordId,
            @Param("userId") Long userId
    );

    long countByUser_IdAndEatenAtGreaterThanEqualAndEatenAtLessThan(
            Long userId,
            Instant startInclusive,
            Instant endExclusive
    );
}
