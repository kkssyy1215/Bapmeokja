package com.bapmeokja.api.fridge;

import com.bapmeokja.api.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@Entity
@Table(
        name = "fridge_ingredients",
        indexes = @Index(name = "idx_fridge_user_expiry", columnList = "user_id,expiry_date")
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FridgeIngredient {
    @Id
    @Column(length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private double quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public FridgeIngredient(
            String id,
            User user,
            String name,
            double quantity,
            String unit,
            LocalDate expiryDate
    ) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.expiryDate = expiryDate;
    }

    public void update(double quantity, String unit, LocalDate expiryDate) {
        this.quantity = quantity;
        this.unit = unit;
        this.expiryDate = expiryDate;
    }
}
