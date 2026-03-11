-- =====================================================
-- Seed Data: Menu Items (Public Schema) - Complete
-- =====================================================

-- Clear existing data
TRUNCATE TABLE public.menu_items CASCADE;
ALTER SEQUENCE public.menu_items_id_seq RESTART WITH 1;

-- Insert Menu Items for Demeshq (id=1)
INSERT INTO public.menu_items (
    food_truck_id, name, description, price, image_url, category, prep_time_minutes, 
    is_available, is_active, stock_quantity, calories, allergens
) VALUES
(1, 'Chicken Shawarma Wrap', 'Marinated chicken with garlic sauce, pickles, and fresh vegetables wrapped in saj bread', 45.00, '/images/menu/shawarma-chicken.jpg', 'Wraps', 10, true, true, 50, 450, ARRAY['gluten', 'garlic']::text[]),
(1, 'Beef Shawarma Plate', 'Sliced beef shawarma served with rice, grilled vegetables, and tahini sauce', 75.00, '/images/menu/shawarma-beef.jpg', 'Plates', 15, true, true, 30, 650, ARRAY['sesame']::text[]),
(1, 'Falafel Sandwich', 'Crispy falafel patties with tahini sauce, tomatoes, and lettuce in pita bread', 35.00, '/images/menu/falafel.jpg', 'Sandwiches', 8, true, true, 60, 380, ARRAY['gluten', 'sesame']::text[]),
(1, 'Hummus Bowl', 'Smooth chickpea dip with olive oil, served with warm pita bread', 30.00, '/images/menu/hummus.jpg', 'Sides', 5, true, true, 40, 250, ARRAY['gluten', 'sesame']::text[]),
(1, 'Fattoush Salad', 'Fresh mixed greens with crispy pita chips, pomegranate molasses dressing', 40.00, '/images/menu/fattoush.jpg', 'Salads', 10, true, true, 35, 200, ARRAY['gluten']::text[]);

-- Insert Menu Items for Container (id=2)
INSERT INTO public.menu_items (
    food_truck_id, name, description, price, image_url, category, prep_time_minutes, 
    is_available, is_active, stock_quantity, calories, allergens
) VALUES
(2, 'Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, cheese, and special sauce', 65.00, '/images/Container/Classic Beef Burger.jpg', 'Main Course', 15, true, true, 40, 720, ARRAY['gluten', 'dairy', 'eggs']::text[]),
(2, 'Crispy Chicken Burger', 'Breaded chicken breast with coleslaw and mayo', 60.00, '/images/Container/Crispy Chicken Burger.jpg', 'Main Course', 12, true, true, 45, 580, ARRAY['gluten', 'eggs']::text[]),
(2, 'Mushroom Swiss Burger', 'Beef patty with sautéed mushrooms and Swiss cheese', 75.00, '/images/Container/Mushroom Swiss Burger.jpg', 'Main Course', 15, true, true, 35, 680, ARRAY['gluten', 'dairy']::text[]),
(2, 'Chicken Caesar Wrap', 'Grilled chicken with romaine, parmesan, and Caesar dressing', 55.00, '/images/Container/Chicken Caesar Wrap.jpg', 'Main Course', 10, true, true, 45, 480, ARRAY['gluten', 'dairy', 'eggs', 'fish']::text[]),
(2, 'BBQ Sandwich', 'Slow-cooked pork with BBQ sauce and coleslaw', 70.00, '/images/Container/BBQ Sandwich.jpg', 'Sandwiches', 12, false, true, 30, 620, ARRAY['gluten']::text[]),
(2, 'Mediterranean Quinoa Bowl', 'Quinoa with roasted vegetables, feta, and lemon dressing', 65.00, '/images/Container/Mediterranean Quinoa Bowl.jpg', 'Main Course', 12, true, true, 40, 450, ARRAY['dairy']::text[]),
(2, 'Sweet Potato Fries', 'Crispy sweet potato fries with chipotle mayo', 30.00, '/images/Container/Sweet Potato Fries.jpg', 'Sides', 10, true, true, 60, 280, ARRAY[]::text[]),
(2, 'Loaded Nachos', 'Tortilla chips with cheese, jalapeños, and sour cream', 45.00, '/images/Container/Loaded Nachos.jpg', 'Sides', 8, true, true, 50, 520, ARRAY['dairy']::text[]),
(2, 'Iced Coffee', 'Cold brew coffee with milk', 25.00, '/images/Container/iced coffe.jpg', 'Beverages', 3, true, true, 80, 120, ARRAY['dairy']::text[]),
(2, 'Chocolate Brownie', 'Rich chocolate brownie with walnuts', 30.00, '/images/Container/Chocolate Brownie.jpg', 'Sides', 5, true, true, 55, 380, ARRAY['gluten', 'nuts', 'dairy']::text[]);

-- Insert Menu Items for Essens (id=3)
INSERT INTO public.menu_items (
    food_truck_id, name, description, price, image_url, category, prep_time_minutes, 
    is_available, is_active, stock_quantity, calories, allergens
) VALUES
(3, 'Club Sandwich', 'Triple-decker with grilled chicken, crispy bacon, lettuce, tomato, and mayo', 60.00, '/images/menu/club-sandwich.jpg', 'Sandwiches', 12, true, true, 35, 580, ARRAY['gluten', 'dairy', 'eggs']::text[]),
(3, 'Tuna Panini', 'Grilled panini with tuna, melted cheese, and caramelized onions', 55.00, '/images/menu/tuna-panini.jpg', 'Sandwiches', 10, true, true, 40, 490, ARRAY['gluten', 'dairy', 'fish']::text[]),
(3, 'Caesar Wrap', 'Grilled chicken caesar salad wrapped in tortilla with parmesan', 50.00, '/images/menu/caesar-wrap.jpg', 'Wraps', 8, true, true, 45, 420, ARRAY['gluten', 'dairy', 'eggs', 'fish']::text[]),
(3, 'Mozzarella Sticks', 'Crispy fried mozzarella sticks served with marinara sauce', 35.00, '/images/menu/mozz-sticks.jpg', 'Sides', 8, true, true, 50, 380, ARRAY['gluten', 'dairy']::text[]),
(3, 'Iced Coffee', 'Cold brew coffee with milk and ice, sweetened to perfection', 25.00, '/images/menu/iced-coffee.jpg', 'Beverages', 3, true, true, 80, 120, ARRAY['dairy']::text[]);

-- Insert Menu Items for Ftar w Asha (id=4)
INSERT INTO public.menu_items (
    food_truck_id, name, description, price, image_url, category, prep_time_minutes, 
    is_available, is_active, stock_quantity, calories, allergens
) VALUES
(4, 'Ful Medames', 'Traditional Egyptian slow-cooked fava beans with olive oil, cumin, and lemon', 30.00, '/images/menu/ful.jpg', 'Breakfast', 10, true, true, 55, 280, ARRAY[]::text[]),
(4, 'Taameya Sandwich', 'Egyptian style falafel made with fava beans, served in baladi bread', 35.00, '/images/menu/taameya.jpg', 'Sandwiches', 10, true, true, 50, 350, ARRAY['gluten']::text[]),
(4, 'Koshari', 'Layers of rice, lentils, pasta topped with tomato sauce and crispy onions', 40.00, '/images/menu/koshari.jpg', 'Mains', 15, true, true, 45, 520, ARRAY['gluten']::text[]),
(4, 'Mahshi', 'Stuffed grape leaves with seasoned rice, herbs, and lemon', 55.00, '/images/menu/mahshi.jpg', 'Mains', 20, true, true, 30, 380, ARRAY[]::text[]),
(4, 'Baladi Bread', 'Fresh Egyptian flatbread baked in traditional oven', 10.00, '/images/menu/baladi.jpg', 'Sides', 5, true, true, 100, 150, ARRAY['gluten']::text[]);

-- Insert Menu Items for Loaded (id=5)
INSERT INTO public.menu_items (
    food_truck_id, name, description, price, image_url, category, prep_time_minutes, 
    is_available, is_active, stock_quantity, calories, allergens
) VALUES
(5, 'Loaded Cheese Fries', 'Crispy fries topped with melted cheese, bacon bits, and ranch dressing', 50.00, '/images/menu/loaded-fries.jpg', 'Fries', 12, true, true, 40, 680, ARRAY['dairy']::text[]),
(5, 'Classic Burger', 'Angus beef patty with cheddar, lettuce, tomato, pickles, and special sauce', 65.00, '/images/menu/classic-burger.jpg', 'Burgers', 15, true, true, 35, 720, ARRAY['gluten', 'dairy', 'eggs']::text[]),
(5, 'BBQ Chicken Wings', 'Crispy fried wings tossed in tangy BBQ sauce, served with ranch', 55.00, '/images/menu/bbq-wings.jpg', 'Wings', 18, true, true, 45, 580, ARRAY['dairy']::text[]),
(5, 'Chili Cheese Dog', 'All-beef hot dog topped with homemade chili and melted cheese', 45.00, '/images/menu/chili-dog.jpg', 'Hot Dogs', 10, true, true, 50, 520, ARRAY['gluten', 'dairy']::text[]),
(5, 'Milkshake', 'Thick and creamy shake in vanilla, chocolate, or strawberry', 30.00, '/images/menu/milkshake.jpg', 'Beverages', 5, true, true, 60, 450, ARRAY['dairy']::text[]);

-- Display seed results with all important fields
SELECT 
    mi.id,
    ft.name as truck_name,
    mi.name as item_name,
    mi.price,
    mi.category,
    mi.calories,
    mi.prep_time_minutes,
    mi.stock_quantity,
    mi.is_available,
    array_to_string(mi.allergens, ', ') as allergens
FROM public.menu_items mi
JOIN public.food_trucks ft ON mi.food_truck_id = ft.id
ORDER BY ft.id, mi.category, mi.name;

SELECT COUNT(*) as total_menu_items FROM public.menu_items;
SELECT 'Menu items seeded successfully with all fields!' as status;
