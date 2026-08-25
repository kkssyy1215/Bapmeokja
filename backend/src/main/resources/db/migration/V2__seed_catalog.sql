INSERT INTO foods (
    id, name, base_weight_gram, calorie, carb, protein, fat, sodium, cholesterol
) VALUES
    ('food_001', '백미밥', 100, 150, 33, 2.6, 0.3, 2, 0),
    ('food_002', '현미밥', 100, 153, 31.5, 2.8, 1.1, 5, 0),
    ('food_003', '달걀', 100, 143, 0.7, 12.6, 9.5, 142, 372),
    ('food_004', '닭가슴살', 100, 165, 0, 31, 3.6, 74, 85),
    ('food_005', '참치 통조림', 100, 116, 0, 25.5, 1, 310, 38),
    ('food_006', '채소 샐러드', 100, 30, 5.7, 1.7, 0.4, 43, 0),
    ('food_007', '식빵', 100, 265, 49, 9, 3.5, 490, 0),
    ('food_008', '라면', 120, 500, 79, 10, 16, 1790, 0),
    ('food_009', '삼겹살', 100, 331, 0, 18, 28.6, 44, 72),
    ('food_010', '두부', 100, 84, 2.3, 9.3, 4.7, 8, 0),
    ('food_011', '바나나', 100, 89, 22.8, 1.1, 0.3, 1, 0),
    ('food_012', '그릭 요거트', 100, 97, 3.9, 9, 5, 36, 13);

INSERT INTO menu_categories (id, name, icon_url) VALUES
    ('cat_001', '포케', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80'),
    ('cat_002', '샌드위치', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'),
    ('cat_003', '한식', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80'),
    ('cat_004', '샐러드', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80');

INSERT INTO menu_items (
    id, category_id, name, image_url, calorie, carb, protein, fat, avg_price
) VALUES
    ('menu_001', 'cat_001', '닭가슴살 현미 포케', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80', 520, 64, 38, 13, 10900),
    ('menu_002', 'cat_001', '연어 아보카도 포케', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80', 560, 55, 32, 22, 12900),
    ('menu_003', 'cat_002', '에그마요 통밀 샌드위치', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80', 380, 42, 18, 14, 5500),
    ('menu_004', 'cat_002', '닭가슴살 클럽 샌드위치', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=80', 445, 46, 31, 15, 7200),
    ('menu_005', 'cat_003', '소고기 비빔밥', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=900&q=80', 610, 78, 27, 21, 9500),
    ('menu_006', 'cat_003', '두부 된장찌개 정식', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80', 490, 65, 25, 15, 9000),
    ('menu_007', 'cat_004', '리코타 치즈 샐러드', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80', 390, 31, 20, 22, 9800),
    ('menu_008', 'cat_004', '훈제오리 단호박 샐러드', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80', 470, 39, 29, 24, 10800);

INSERT INTO menu_item_ingredients (id, menu_item_id, name, weight_gram) VALUES
    (1, 'menu_001', '현미밥', 150), (2, 'menu_001', '닭가슴살', 120), (3, 'menu_001', '채소', 120),
    (4, 'menu_002', '현미밥', 140), (5, 'menu_002', '연어', 100), (6, 'menu_002', '아보카도', 50),
    (7, 'menu_003', '통밀빵', 90), (8, 'menu_003', '달걀', 100), (9, 'menu_003', '채소', 50),
    (10, 'menu_004', '통밀빵', 90), (11, 'menu_004', '닭가슴살', 100), (12, 'menu_004', '토마토', 50),
    (13, 'menu_005', '백미밥', 180), (14, 'menu_005', '소고기', 90), (15, 'menu_005', '나물', 140),
    (16, 'menu_006', '두부', 100), (17, 'menu_006', '된장', 25), (18, 'menu_006', '백미밥', 150),
    (19, 'menu_007', '채소', 160), (20, 'menu_007', '리코타 치즈', 70), (21, 'menu_007', '견과류', 20),
    (22, 'menu_008', '채소', 150), (23, 'menu_008', '훈제오리', 100), (24, 'menu_008', '단호박', 80);

INSERT INTO recipe_categories (id, name, image_url) VALUES
    ('hcat_001', '닭가슴살 볶음밥', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'),
    ('hcat_002', '두부 된장찌개', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'),
    ('hcat_003', '연어 샐러드', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80');

INSERT INTO recipes (
    id, category_id, name, image_url, calorie, carb, protein, fat,
    cooking_time_minutes, difficulty, estimated_cost
) VALUES
    ('recipe_001', 'hcat_001', '닭가슴살 달걀 볶음밥', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80', 535, 66, 39, 12, 20, 'EASY', 5200),
    ('recipe_002', 'hcat_001', '참치 김치 볶음밥', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=80', 510, 70, 27, 13, 18, 'EASY', 4500),
    ('recipe_003', 'hcat_002', '두부 애호박 된장찌개', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80', 315, 27, 24, 13, 25, 'EASY', 3900),
    ('recipe_004', 'hcat_002', '버섯 순두부찌개', 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1000&q=80', 340, 24, 23, 17, 28, 'MEDIUM', 4700),
    ('recipe_005', 'hcat_003', '연어 아보카도 샐러드', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80', 455, 25, 32, 27, 15, 'EASY', 8500),
    ('recipe_006', 'hcat_003', '닭가슴살 시저 샐러드', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1000&q=80', 405, 29, 38, 16, 15, 'EASY', 6200);

INSERT INTO recipe_ingredients (id, recipe_id, name, amount) VALUES
    (1, 'recipe_001', '현미밥', '150g'), (2, 'recipe_001', '닭가슴살', '120g'), (3, 'recipe_001', '달걀', '1개'), (4, 'recipe_001', '대파', '20g'),
    (5, 'recipe_002', '백미밥', '150g'), (6, 'recipe_002', '참치 통조림', '100g'), (7, 'recipe_002', '김치', '100g'), (8, 'recipe_002', '달걀', '1개'),
    (9, 'recipe_003', '두부', '150g'), (10, 'recipe_003', '애호박', '80g'), (11, 'recipe_003', '된장', '1.5큰술'), (12, 'recipe_003', '양파', '50g'),
    (13, 'recipe_004', '순두부', '200g'), (14, 'recipe_004', '버섯', '100g'), (15, 'recipe_004', '달걀', '1개'), (16, 'recipe_004', '고춧가루', '1큰술'),
    (17, 'recipe_005', '연어', '120g'), (18, 'recipe_005', '아보카도', '1/2개'), (19, 'recipe_005', '샐러드 채소', '150g'), (20, 'recipe_005', '방울토마토', '6개'),
    (21, 'recipe_006', '닭가슴살', '120g'), (22, 'recipe_006', '로메인', '150g'), (23, 'recipe_006', '통밀빵', '1장'), (24, 'recipe_006', '그릭 요거트', '50g');

INSERT INTO recipe_ingredient_alternatives (id, recipe_ingredient_id, name, reason) VALUES
    (1, 1, '백미밥', '현미밥이 없다면 같은 양의 백미밥을 사용할 수 있습니다.'),
    (2, 2, '단단한 두부', '닭가슴살 대신 물기를 뺀 두부를 사용하면 식물성 단백질을 보충할 수 있습니다.'),
    (3, 10, '양배추', '애호박이 없다면 비슷한 양의 양배추로 식감을 더할 수 있습니다.'),
    (4, 17, '고등어', '연어 대신 구운 고등어를 사용하면 오메가-3 지방산을 섭취할 수 있습니다.'),
    (5, 24, '무가당 두유', '그릭 요거트 대신 무가당 두유를 소량 넣어 드레싱 농도를 맞출 수 있습니다.');

INSERT INTO recipe_steps (id, recipe_id, step_no, description) VALUES
    (1, 'recipe_001', 1, '닭가슴살과 대파를 한입 크기로 썹니다.'),
    (2, 'recipe_001', 2, '팬에 닭가슴살과 대파를 익힌 뒤 달걀을 넣어 볶습니다.'),
    (3, 'recipe_001', 3, '현미밥을 넣고 간장 1작은술로 간해 고루 볶습니다.'),
    (4, 'recipe_002', 1, '기름을 뺀 참치와 잘게 썬 김치를 준비합니다.'),
    (5, 'recipe_002', 2, '김치와 참치를 볶다가 밥을 넣어 고루 섞습니다.'),
    (6, 'recipe_002', 3, '반숙 달걀을 올려 마무리합니다.'),
    (7, 'recipe_003', 1, '양파와 애호박, 두부를 먹기 좋은 크기로 썹니다.'),
    (8, 'recipe_003', 2, '물 400ml에 된장을 풀고 양파와 애호박을 8분간 끓입니다.'),
    (9, 'recipe_003', 3, '두부를 넣고 5분 더 끓여 완성합니다.'),
    (10, 'recipe_004', 1, '버섯을 손질하고 냄비에 물 350ml를 끓입니다.'),
    (11, 'recipe_004', 2, '버섯과 순두부, 고춧가루를 넣어 10분간 끓입니다.'),
    (12, 'recipe_004', 3, '달걀을 넣고 흰자가 익을 때까지 끓입니다.'),
    (13, 'recipe_005', 1, '연어는 팬에 앞뒤로 익힌 뒤 한입 크기로 나눕니다.'),
    (14, 'recipe_005', 2, '채소와 토마토, 아보카도를 그릇에 담습니다.'),
    (15, 'recipe_005', 3, '구운 연어를 올리고 레몬즙과 후추를 곁들입니다.'),
    (16, 'recipe_006', 1, '닭가슴살을 구운 뒤 결대로 찢습니다.'),
    (17, 'recipe_006', 2, '로메인과 구운 통밀빵을 먹기 좋은 크기로 자릅니다.'),
    (18, 'recipe_006', 3, '그릭 요거트에 레몬즙과 후추를 섞은 드레싱을 곁들입니다.');

INSERT INTO stores (id, name, address, lat, lng) VALUES
    ('store_001', '밸런스 포케 강남점', '서울특별시 강남구 강남대로 438', 37.4987, 127.0274),
    ('store_002', '그린테이블 강남역점', '서울특별시 강남구 테헤란로 8길 21', 37.4982, 127.0290),
    ('store_003', '소담한상 역삼점', '서울특별시 강남구 역삼로 109', 37.4965, 127.0281);

INSERT INTO store_menus (id, store_id, menu_item_id, name, calorie, price) VALUES
    (1, 'store_001', 'menu_001', '닭가슴살 현미 포케', 520, 10900),
    (2, 'store_001', 'menu_002', '연어 아보카도 포케', 560, 12900),
    (3, 'store_001', 'menu_007', '리코타 치즈 샐러드', 390, 9800),
    (4, 'store_002', 'menu_003', '에그마요 통밀 샌드위치', 380, 5500),
    (5, 'store_002', 'menu_004', '닭가슴살 클럽 샌드위치', 445, 7200),
    (6, 'store_002', 'menu_008', '훈제오리 단호박 샐러드', 470, 10800),
    (7, 'store_003', 'menu_005', '소고기 비빔밥', 610, 9500),
    (8, 'store_003', 'menu_006', '두부 된장찌개 정식', 490, 9000);
