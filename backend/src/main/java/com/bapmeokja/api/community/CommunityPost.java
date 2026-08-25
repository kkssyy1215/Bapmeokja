package com.bapmeokja.api.community;

import com.bapmeokja.api.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "posts",
        indexes = {
                @Index(name = "idx_posts_created", columnList = "created_at"),
                @Index(name = "idx_posts_user_created", columnList = "user_id,created_at")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommunityPost {
    @Id
    @Column(length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "eaten_at")
    private Instant eatenAt;

    @Column(name = "food_name", length = 120)
    private String foodName;

    private Integer calorie;
    private Double carb;
    private Double protein;
    private Double fat;

    @Column(name = "like_count", nullable = false)
    private int likeCount;

    @Column(name = "comment_count", nullable = false)
    private int commentCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public CommunityPost(
            String id,
            User user,
            String content,
            String imageUrl,
            Instant eatenAt,
            String foodName,
            Integer calorie,
            Double carb,
            Double protein,
            Double fat
    ) {
        this.id = id;
        this.user = user;
        this.content = content;
        this.imageUrl = imageUrl;
        this.eatenAt = eatenAt;
        this.foodName = foodName;
        this.calorie = calorie;
        this.carb = carb;
        this.protein = protein;
        this.fat = fat;
        this.likeCount = 0;
        this.commentCount = 0;
    }

    public void updateContent(String content) {
        this.content = content;
    }

    public void increaseLikeCount() {
        likeCount++;
    }

    public void decreaseLikeCount() {
        likeCount = Math.max(0, likeCount - 1);
    }

    public void increaseCommentCount() {
        commentCount++;
    }

    public void decreaseCommentCount() {
        commentCount = Math.max(0, commentCount - 1);
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
