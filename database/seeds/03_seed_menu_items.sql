-- =====================================================
-- Seed Data: Menu Items
-- =====================================================

-- Clear existing data
TRUNCATE TABLE menu_items CASCADE;
RESET SEQUENCE menu_items_id_seq;

-- =====================================================
-- Demeshq Menu (Syrian Cuisine)
-- =====================================================
INSERT INTO menu_items (food_truck_id, name, description, price, category, prep_time_minutes, is_available, calories, allergens) VALUES
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Chicken Shawarma Sandwich', 'Marinated chicken with garlic sauce, pickles, and tahini', 45.00, 'Sandwiches', 8, TRUE, 450, ARRAY['gluten', 'dairy']),
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Beef Shawarma Plate', 'Sliced beef shawarma with rice, hummus, and salad', 85.00, 'Main Dishes', 12, TRUE, 650, ARRAY['gluten']),
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Falafel Sandwich', 'Crispy falafel with tahini, vegetables, and pickles', 35.00, 'Sandwiches', 6, TRUE, 380, ARRAY['gluten', 'sesame']),
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Mixed Grill Plate', 'Kebab, kofta, and chicken with rice and grilled vegetables', 120.00, 'Main Dishes', 15, TRUE, 800, NULL),
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Hummus Bowl', 'Smooth chickpea dip with olive oil and warm pita', 30.00, 'Appetizers', 5, TRUE, 250, ARRAY['gluten', 'sesame']),
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Fattoush Salad', 'Fresh vegetable salad with crispy pita chips and sumac dressing', 40.00, 'Salads', 7, TRUE, 200, ARRAY['gluten']),
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Lentil Soup', 'Traditional red lentil soup with lemon and cumin', 25.00, 'Soups', 5, TRUE, 180, NULL),
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Fresh Lemonade', 'Homemade mint lemonade', 20.00, 'Drinks', 3, TRUE, 120, NULL),
((SELECT id FROM food_trucks WHERE name = 'Demeshq'), 'Baklava', 'Sweet pastry with nuts and honey', 25.00, 'Desserts', 2, TRUE, 320, ARRAY['gluten', 'nuts', 'dairy']);

-- =====================================================
-- Container Menu (Fusion/Burgers)
-- =====================================================
INSERT INTO menu_items (food_truck_id, name, description, price, category, prep_time_minutes, is_available, calories, allergens) VALUES
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, cheese, and special sauce', 65.00, 'Burgers', 10, TRUE, 550, ARRAY['gluten', 'dairy']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Crispy Chicken Burger', 'Breaded chicken breast with coleslaw and mayo', 60.00, 'Burgers', 10, TRUE, 520, ARRAY['gluten', 'dairy', 'eggs']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Mushroom Swiss Burger', 'Beef patty with sautéed mushrooms and Swiss cheese', 75.00, 'Burgers', 12, TRUE, 600, ARRAY['gluten', 'dairy']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Chicken Caesar Wrap', 'Grilled chicken with romaine, parmesan, and Caesar dressing', 55.00, 'Wraps', 8, TRUE, 480, ARRAY['gluten', 'dairy', 'fish']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'BBQ Pulled Pork Sandwich', 'Slow-cooked pork with BBQ sauce and coleslaw', 70.00, 'Sandwiches', 10, FALSE, 620, ARRAY['gluten']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Mediterranean Quinoa Bowl', 'Quinoa with roasted vegetables, feta, and lemon dressing', 65.00, 'Bowls', 8, TRUE, 420, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Sweet Potato Fries', 'Crispy sweet potato fries with chipotle mayo', 30.00, 'Sides', 7, TRUE, 280, ARRAY['eggs']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Loaded Nachos', 'Tortilla chips with cheese, jalapeños, and sour cream', 45.00, 'Sides', 6, TRUE, 450, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Iced Coffee', 'Cold brew coffee with milk', 25.00, 'Drinks', 3, TRUE, 80, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Container'), 'Chocolate Brownie', 'Rich chocolate brownie with walnuts', 30.00, 'Desserts', 2, TRUE, 380, ARRAY['gluten', 'nuts', 'dairy', 'eggs']);

-- =====================================================
-- Essens Menu (Healthy Food)
-- =====================================================
INSERT INTO menu_items (food_truck_id, name, description, price, category, prep_time_minutes, is_available, calories, allergens) VALUES
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Grilled Chicken Power Bowl', 'Grilled chicken breast with quinoa, avocado, and mixed greens', 75.00, 'Bowls', 10, TRUE, 480, NULL),
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Salmon Poke Bowl', 'Fresh salmon with brown rice, edamame, and sesame dressing', 95.00, 'Bowls', 12, TRUE, 550, ARRAY['fish', 'soy', 'sesame']),
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Vegan Buddha Bowl', 'Roasted chickpeas, sweet potato, kale, and tahini dressing', 65.00, 'Bowls', 10, TRUE, 420, ARRAY['sesame']),
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Greek Yogurt Parfait', 'Greek yogurt with granola, berries, and honey', 40.00, 'Breakfast', 5, TRUE, 320, ARRAY['dairy', 'gluten', 'nuts']),
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Acai Smoothie Bowl', 'Acai berry smoothie topped with fresh fruit and coconut', 55.00, 'Bowls', 8, TRUE, 350, ARRAY['nuts']),
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Green Detox Juice', 'Kale, cucumber, apple, and ginger juice', 35.00, 'Drinks', 4, TRUE, 120, NULL),
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Protein Shake', 'Chocolate or vanilla protein shake with almond milk', 45.00, 'Drinks', 3, TRUE, 250, ARRAY['dairy', 'nuts']),
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Mixed Berry Smoothie', 'Strawberries, blueberries, banana, and yogurt', 40.00, 'Drinks', 4, TRUE, 220, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Essens'), 'Avocado Toast', 'Whole grain toast with smashed avocado, eggs, and seeds', 50.00, 'Breakfast', 6, TRUE, 380, ARRAY['gluten', 'eggs']);

-- =====================================================
-- Ftar w Asha Menu (Egyptian Breakfast/Lunch)
-- =====================================================
INSERT INTO menu_items (food_truck_id, name, description, price, category, prep_time_minutes, is_available, calories, allergens) VALUES
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Ful Medames', 'Traditional Egyptian fava beans with olive oil and spices', 30.00, 'Breakfast', 8, TRUE, 280, NULL),
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Taameya (Egyptian Falafel)', 'Crispy fava bean falafel with tahini and salad', 35.00, 'Breakfast', 10, TRUE, 320, ARRAY['sesame']),
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Shakshuka', 'Poached eggs in spicy tomato sauce with bread', 45.00, 'Breakfast', 12, TRUE, 380, ARRAY['gluten', 'eggs']),
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Koshary', 'Egyptian rice, lentils, pasta, and crispy onions with tomato sauce', 40.00, 'Main Dishes', 8, TRUE, 450, ARRAY['gluten']),
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Molokhia with Rice', 'Traditional Egyptian green soup with chicken and rice', 55.00, 'Main Dishes', 10, TRUE, 380, NULL),
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Mahshi (Stuffed Vegetables)', 'Grape leaves and zucchini stuffed with rice and herbs', 50.00, 'Main Dishes', 15, TRUE, 320, NULL),
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Baladi Bread', 'Fresh Egyptian flatbread', 5.00, 'Sides', 3, TRUE, 150, ARRAY['gluten']),
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Egyptian Tea', 'Traditional black tea', 10.00, 'Drinks', 2, TRUE, 50, NULL),
((SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'), 'Basbousa', 'Sweet semolina cake with syrup', 25.00, 'Desserts', 3, TRUE, 350, ARRAY['gluten', 'dairy']);

-- =====================================================
-- Loaded Menu (Loaded Fries/Comfort Food)
-- =====================================================
INSERT INTO menu_items (food_truck_id, name, description, price, category, prep_time_minutes, is_available, calories, allergens) VALUES
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Loaded Cheese Fries', 'Crispy fries with melted cheddar, bacon, and jalapeños', 50.00, 'Loaded Fries', 10, TRUE, 580, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Pulled Beef Loaded Fries', 'Fries topped with slow-cooked beef, cheese sauce, and BBQ drizzle', 70.00, 'Loaded Fries', 12, TRUE, 720, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Buffalo Chicken Fries', 'Fries with spicy buffalo chicken, ranch, and blue cheese', 65.00, 'Loaded Fries', 12, TRUE, 680, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Chili Cheese Fries', 'Fries smothered in beef chili and melted cheese', 60.00, 'Loaded Fries', 10, TRUE, 650, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Nachos Supreme', 'Loaded nachos with beef, cheese, guacamole, and sour cream', 65.00, 'Nachos', 10, TRUE, 700, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Mac n Cheese Bowl', 'Creamy mac and cheese with crispy breadcrumb topping', 55.00, 'Comfort Food', 8, TRUE, 520, ARRAY['gluten', 'dairy']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Mozzarella Sticks', '6 crispy mozzarella sticks with marinara sauce', 40.00, 'Appetizers', 7, TRUE, 450, ARRAY['gluten', 'dairy']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Onion Rings', 'Beer-battered crispy onion rings', 35.00, 'Sides', 8, TRUE, 380, ARRAY['gluten']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Milkshake', 'Chocolate, vanilla, or strawberry milkshake', 35.00, 'Drinks', 4, TRUE, 420, ARRAY['dairy']),
((SELECT id FROM food_trucks WHERE name = 'Loaded'), 'Churros', 'Fried dough pastry with chocolate sauce', 30.00, 'Desserts', 6, TRUE, 380, ARRAY['gluten', 'dairy']);

-- Display seed results
SELECT 
    ft.name AS truck_name,
    COUNT(mi.id) AS item_count,
    AVG(mi.price) AS avg_price,
    MIN(mi.price) AS min_price,
    MAX(mi.price) AS max_price
FROM food_trucks ft
LEFT JOIN menu_items mi ON ft.id = mi.food_truck_id
GROUP BY ft.name
ORDER BY ft.name;

SELECT 'Menu items seeded successfully!' as status;
