CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL,
    name VARCHAR(30) NOT NULL,
    nickname VARCHAR(20) NOT NULL,
    agree_terms BIT NOT NULL,
    agree_privacy BIT NOT NULL,
    gender ENUM ('F', 'M') NULL,
    age INT NULL,
    height DOUBLE NULL,
    weight DOUBLE NULL,
    activity_level ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE') NULL,
    goal ENUM ('LOSE', 'MAINTAIN', 'GAIN') NULL,
    skeletal_muscle_mass DOUBLE NULL,
    body_fat_mass DOUBLE NULL,
    body_fat_percentage DOUBLE NULL,
    is_precise_mode BIT NOT NULL DEFAULT b'0',
    is_new_user BIT NOT NULL DEFAULT b'1',
    daily_calorie_goal INT NOT NULL DEFAULT 2000,
    carb_goal_gram INT NOT NULL DEFAULT 250,
    protein_goal_gram INT NOT NULL DEFAULT 125,
    fat_goal_gram INT NOT NULL DEFAULT 55,
    location_consent_granted BIT NOT NULL DEFAULT b'0',
    default_budget_dining_out INT NOT NULL DEFAULT 10000,
    default_budget_home_cooking INT NOT NULL DEFAULT 8000,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_nickname UNIQUE (nickname)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notification_settings (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    push_enabled BIT NOT NULL DEFAULT b'0',
    water_reminder_enabled BIT NOT NULL DEFAULT b'0',
    breakfast_time TIME(6) NULL,
    lunch_time TIME(6) NULL,
    dinner_time TIME(6) NULL,
    expiry_alert_enabled BIT NOT NULL DEFAULT b'0',
    PRIMARY KEY (id),
    CONSTRAINT uk_notification_settings_user UNIQUE (user_id),
    CONSTRAINT fk_notification_settings_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_refresh_tokens_hash UNIQUE (token_hash),
    INDEX idx_refresh_tokens_user (user_id),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE user_devices (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    device_token VARCHAR(512) NOT NULL,
    platform ENUM ('ANDROID', 'IOS') NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_user_devices_token UNIQUE (device_token),
    INDEX idx_user_devices_user (user_id),
    CONSTRAINT fk_user_devices_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE foods (
    id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    base_weight_gram DECIMAL(10, 2) NOT NULL,
    calorie DECIMAL(10, 2) NOT NULL,
    carb DECIMAL(10, 2) NOT NULL,
    protein DECIMAL(10, 2) NOT NULL,
    fat DECIMAL(10, 2) NOT NULL,
    sodium DECIMAL(10, 2) NULL,
    cholesterol DECIMAL(10, 2) NULL,
    PRIMARY KEY (id),
    INDEX idx_foods_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE ai_analyses (
    id VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    image_url VARCHAR(500) NULL,
    food_name VARCHAR(200) NOT NULL,
    total_calorie DECIMAL(10, 2) NOT NULL,
    total_carb DECIMAL(10, 2) NOT NULL,
    total_protein DECIMAL(10, 2) NOT NULL,
    total_fat DECIMAL(10, 2) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_ai_analyses_user (user_id),
    CONSTRAINT fk_ai_analyses_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE ai_analysis_items (
    id VARCHAR(50) NOT NULL,
    analysis_id VARCHAR(50) NOT NULL,
    food_id VARCHAR(50) NULL,
    name VARCHAR(100) NOT NULL,
    weight_gram DECIMAL(10, 2) NOT NULL,
    calorie DECIMAL(10, 2) NOT NULL,
    carb DECIMAL(10, 2) NOT NULL,
    protein DECIMAL(10, 2) NOT NULL,
    fat DECIMAL(10, 2) NOT NULL,
    sodium DECIMAL(10, 2) NOT NULL,
    cholesterol DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_ai_analysis_items_analysis (analysis_id),
    CONSTRAINT fk_ai_analysis_items_analysis FOREIGN KEY (analysis_id)
        REFERENCES ai_analyses (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE diet_records (
    id VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    analyze_id VARCHAR(50) NULL,
    meal_type ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK') NOT NULL,
    eaten_at DATETIME(6) NOT NULL,
    thumbnail_url VARCHAR(500) NULL,
    total_weight_gram DECIMAL(10, 2) NOT NULL,
    total_calorie DECIMAL(10, 2) NOT NULL,
    total_carb DECIMAL(10, 2) NOT NULL,
    total_protein DECIMAL(10, 2) NOT NULL,
    total_fat DECIMAL(10, 2) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_diet_records_user_eaten_at (user_id, eaten_at),
    CONSTRAINT fk_diet_records_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE diet_record_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    diet_record_id VARCHAR(50) NOT NULL,
    food_id VARCHAR(50) NULL,
    name VARCHAR(100) NOT NULL,
    weight_gram DECIMAL(10, 2) NOT NULL,
    calorie DECIMAL(10, 2) NOT NULL,
    carb DECIMAL(10, 2) NOT NULL,
    protein DECIMAL(10, 2) NOT NULL,
    fat DECIMAL(10, 2) NOT NULL,
    sodium DECIMAL(10, 2) NOT NULL,
    cholesterol DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_diet_record_items_record (diet_record_id),
    CONSTRAINT fk_diet_record_items_record FOREIGN KEY (diet_record_id)
        REFERENCES diet_records (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE menu_categories (
    id VARCHAR(40) NOT NULL,
    name VARCHAR(80) NOT NULL,
    icon_url VARCHAR(500) NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE menu_items (
    id VARCHAR(40) NOT NULL,
    category_id VARCHAR(40) NOT NULL,
    name VARCHAR(120) NOT NULL,
    image_url VARCHAR(500) NULL,
    calorie DOUBLE NOT NULL,
    carb DOUBLE NOT NULL,
    protein DOUBLE NOT NULL,
    fat DOUBLE NOT NULL,
    avg_price INT NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_menu_items_category (category_id),
    CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id)
        REFERENCES menu_categories (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE menu_item_ingredients (
    id BIGINT NOT NULL AUTO_INCREMENT,
    menu_item_id VARCHAR(40) NOT NULL,
    name VARCHAR(100) NOT NULL,
    weight_gram DOUBLE NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_menu_item_ing_item (menu_item_id),
    CONSTRAINT fk_menu_item_ingredients_item FOREIGN KEY (menu_item_id)
        REFERENCES menu_items (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE recipe_categories (
    id VARCHAR(40) NOT NULL,
    name VARCHAR(120) NOT NULL,
    image_url VARCHAR(500) NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE recipes (
    id VARCHAR(40) NOT NULL,
    category_id VARCHAR(40) NOT NULL,
    name VARCHAR(120) NOT NULL,
    image_url VARCHAR(500) NULL,
    calorie DOUBLE NOT NULL,
    carb DOUBLE NOT NULL,
    protein DOUBLE NOT NULL,
    fat DOUBLE NOT NULL,
    cooking_time_minutes INT NOT NULL,
    difficulty ENUM ('EASY', 'MEDIUM', 'HARD') NOT NULL,
    estimated_cost INT NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_recipes_category_cost (category_id, estimated_cost),
    CONSTRAINT fk_recipes_category FOREIGN KEY (category_id)
        REFERENCES recipe_categories (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE recipe_ingredients (
    id BIGINT NOT NULL AUTO_INCREMENT,
    recipe_id VARCHAR(40) NOT NULL,
    name VARCHAR(100) NOT NULL,
    amount VARCHAR(80) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_recipe_ing_recipe (recipe_id),
    CONSTRAINT fk_recipe_ingredients_recipe FOREIGN KEY (recipe_id)
        REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE recipe_ingredient_alternatives (
    id BIGINT NOT NULL AUTO_INCREMENT,
    recipe_ingredient_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    reason VARCHAR(300) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_recipe_alt_ingredient (recipe_ingredient_id),
    CONSTRAINT fk_recipe_alternatives_ingredient FOREIGN KEY (recipe_ingredient_id)
        REFERENCES recipe_ingredients (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE recipe_steps (
    id BIGINT NOT NULL AUTO_INCREMENT,
    recipe_id VARCHAR(40) NOT NULL,
    step_no INT NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_recipe_steps_order (recipe_id, step_no),
    CONSTRAINT fk_recipe_steps_recipe FOREIGN KEY (recipe_id)
        REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE fridge_ingredients (
    id VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    quantity DOUBLE NOT NULL,
    unit VARCHAR(20) NOT NULL,
    expiry_date DATE NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_fridge_user_expiry (user_id, expiry_date),
    CONSTRAINT fk_fridge_ingredients_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE stores (
    id VARCHAR(40) NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(300) NOT NULL,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_stores_location (lat, lng)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE store_menus (
    id BIGINT NOT NULL AUTO_INCREMENT,
    store_id VARCHAR(40) NOT NULL,
    menu_item_id VARCHAR(40) NOT NULL,
    name VARCHAR(120) NOT NULL,
    calorie DOUBLE NOT NULL,
    price INT NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_store_menus_store (store_id),
    INDEX idx_store_menus_item (menu_item_id),
    CONSTRAINT fk_store_menus_store FOREIGN KEY (store_id)
        REFERENCES stores (id) ON DELETE CASCADE,
    CONSTRAINT fk_store_menus_item FOREIGN KEY (menu_item_id)
        REFERENCES menu_items (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE posts (
    id VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500) NULL,
    eaten_at DATETIME(6) NULL,
    food_name VARCHAR(120) NULL,
    calorie INT NULL,
    carb DOUBLE NULL,
    protein DOUBLE NULL,
    fat DOUBLE NULL,
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_posts_created (created_at),
    INDEX idx_posts_user_created (user_id, created_at),
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE comments (
    id VARCHAR(40) NOT NULL,
    post_id VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_comments_post_created (post_id, created_at),
    INDEX idx_comments_user (user_id),
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id)
        REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE post_likes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    post_id VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_post_likes_post_user UNIQUE (post_id, user_id),
    INDEX idx_post_likes_user (user_id),
    CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id)
        REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
