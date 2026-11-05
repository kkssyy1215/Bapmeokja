-- 5천원 이하 예산에도 추천할 수 있도록 간편식 메뉴를 추가한다.
INSERT INTO menu_categories (id, name, icon_url) VALUES
    ('cat_005', '간편식', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80');

INSERT INTO menu_items (id, category_id, name, image_url, calorie, carb, protein, fat, avg_price) VALUES
    ('menu_009', 'cat_005', '참치 야채 김밥', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80', 420, 62, 16, 11, 3800),
    ('menu_010', 'cat_005', '닭가슴살 컵밥', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80', 465, 64, 27, 10, 4900);

INSERT INTO menu_item_ingredients (menu_item_id, name, weight_gram) VALUES
    ('menu_009', '밥', 180), ('menu_009', '참치', 40), ('menu_009', '채소', 60),
    ('menu_010', '밥', 180), ('menu_010', '닭가슴살', 90), ('menu_010', '채소', 50);

INSERT INTO store_menus (store_id, menu_item_id, name, calorie, price) VALUES
    ('store_003', 'menu_009', '참치 야채 김밥', 420, 3800),
    ('store_003', 'menu_010', '닭가슴살 컵밥', 465, 4900);
