package com.bapmeokja.api.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String nickname;

    @Column(name = "agree_terms", nullable = false)
    private boolean agreeTerms;

    @Column(name = "agree_privacy", nullable = false)
    private boolean agreePrivacy;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private Gender gender;

    private Integer age;

    private Double height;

    private Double weight;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level", length = 24)
    private ActivityLevel activityLevel;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private Goal goal;

    @Column(name = "skeletal_muscle_mass")
    private Double skeletalMuscleMass;

    @Column(name = "body_fat_mass")
    private Double bodyFatMass;

    @Column(name = "body_fat_percentage")
    private Double bodyFatPercentage;

    @Column(name = "is_precise_mode", nullable = false)
    private boolean preciseMode;

    @Column(name = "is_new_user", nullable = false)
    private boolean newUser;

    @Column(name = "daily_calorie_goal", nullable = false)
    private Integer dailyCalorieGoal;

    @Column(name = "carb_goal_gram", nullable = false)
    private Integer carbGoalGram;

    @Column(name = "protein_goal_gram", nullable = false)
    private Integer proteinGoalGram;

    @Column(name = "fat_goal_gram", nullable = false)
    private Integer fatGoalGram;

    @Column(name = "location_consent_granted", nullable = false)
    private boolean locationConsentGranted;

    @Column(name = "default_budget_dining_out", nullable = false)
    private Integer defaultBudgetDiningOut;

    @Column(name = "default_budget_home_cooking", nullable = false)
    private Integer defaultBudgetHomeCooking;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public static User create(
            String username,
            String encodedPassword,
            String email,
            String name,
            String nickname,
            boolean agreeTerms,
            boolean agreePrivacy
    ) {
        User user = new User();
        user.username = username;
        user.password = encodedPassword;
        user.email = email;
        user.name = name;
        user.nickname = nickname;
        user.agreeTerms = agreeTerms;
        user.agreePrivacy = agreePrivacy;
        user.newUser = true;
        user.preciseMode = false;
        user.locationConsentGranted = false;
        user.dailyCalorieGoal = 2000;
        user.carbGoalGram = 250;
        user.proteinGoalGram = 125;
        user.fatGoalGram = 55;
        user.defaultBudgetDiningOut = 10000;
        user.defaultBudgetHomeCooking = 8000;
        return user;
    }

    public void initializeProfile(
            Gender gender,
            int age,
            double height,
            double weight,
            ActivityLevel activityLevel,
            Goal goal,
            Double skeletalMuscleMass,
            Double bodyFatMass,
            Double bodyFatPercentage,
            NutritionGoals goals
    ) {
        this.gender = gender;
        this.age = age;
        this.height = height;
        this.weight = weight;
        this.activityLevel = activityLevel;
        this.goal = goal;
        this.skeletalMuscleMass = skeletalMuscleMass;
        this.bodyFatMass = bodyFatMass;
        this.bodyFatPercentage = bodyFatPercentage;
        applyNutritionGoals(goals);
        this.newUser = false;
    }

    public void updateProfile(
            String nickname,
            Gender gender,
            Integer age,
            Double height,
            Double weight,
            ActivityLevel activityLevel,
            Goal goal,
            Double skeletalMuscleMass,
            Double bodyFatMass,
            Double bodyFatPercentage
    ) {
        if (nickname != null) {
            this.nickname = nickname;
        }
        if (gender != null) {
            this.gender = gender;
        }
        if (age != null) {
            this.age = age;
        }
        if (height != null) {
            this.height = height;
        }
        if (weight != null) {
            this.weight = weight;
        }
        if (activityLevel != null) {
            this.activityLevel = activityLevel;
        }
        if (goal != null) {
            this.goal = goal;
        }
        if (skeletalMuscleMass != null) {
            this.skeletalMuscleMass = skeletalMuscleMass;
        }
        if (bodyFatMass != null) {
            this.bodyFatMass = bodyFatMass;
        }
        if (bodyFatPercentage != null) {
            this.bodyFatPercentage = bodyFatPercentage;
        }
    }

    public void applyNutritionGoals(NutritionGoals goals) {
        this.dailyCalorieGoal = goals.dailyCalorieGoal();
        this.carbGoalGram = goals.carbGoalGram();
        this.proteinGoalGram = goals.proteinGoalGram();
        this.fatGoalGram = goals.fatGoalGram();
        this.preciseMode = goals.preciseMode();
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void changeLocationConsent(boolean agreed) {
        this.locationConsentGranted = agreed;
    }

    public void changeBudgets(Integer diningOut, Integer homeCooking) {
        if (diningOut != null) {
            this.defaultBudgetDiningOut = diningOut;
        }
        if (homeCooking != null) {
            this.defaultBudgetHomeCooking = homeCooking;
        }
    }

    public boolean isNewUser() {
        return newUser;
    }

    public boolean isPreciseMode() {
        return preciseMode;
    }

    public boolean isLocationConsentGranted() {
        return locationConsentGranted;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
