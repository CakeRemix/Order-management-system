-- =====================================================
-- Seed Data: Menu Items
-- Schema: FoodTruck
-- =====================================================

-- Clear existing data
TRUNCATE TABLE FoodTruck.MenuItems CASCADE;
TRUNCATE TABLE FoodTruck.Truck_Contains_MenuItems CASCADE;
ALTER SEQUENCE FoodTruck.MenuItems_itemid_seq RESTART WITH 1;

-- =====================================================
-- Demeshq Menu (Syrian Cuisine)
-- =====================================================
INSERT INTO FoodTruck.MenuItems (truckId, name, description, price, category, status) VALUES
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Chicken Shawarma Sandwich', 'Marinated chicken with garlic sauce, pickles, and tahini', 45.00, 'Sandwiches', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Beef Shawarma Plate', 'Sliced beef shawarma with rice, hummus, and salad', 85.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Falafel Sandwich', 'Crispy falafel with tahini, vegetables, and pickles', 35.00, 'Sandwiches', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Mixed Grill Plate', 'Kebab, kofta, and chicken with rice and grilled vegetables', 120.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Hummus Bowl', 'Smooth chickpea dip with olive oil and warm pita', 30.00, 'Sides', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Fattoush Salad', 'Fresh vegetable salad with crispy pita chips and sumac dressing', 40.00, 'Sides', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Lentil Soup', 'Traditional red lentil soup with lemon and cumin', 25.00, 'Sides', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Fresh Lemonade', 'Homemade mint lemonade', 20.00, 'Beverages', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'Baklava', 'Sweet pastry with nuts and honey', 25.00, 'Sides', 'available');

-- =====================================================
-- Container Menu (Fusion/Burgers)
-- =====================================================
INSERT INTO FoodTruck.MenuItems (truckId, name, description, price, category, status, imageUrl) VALUES
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, cheese, and special sauce', 65.00, 'Main Course', 'available', '/images/Container/Classic Beef Burger.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Crispy Chicken Burger', 'Breaded chicken breast with coleslaw and mayo', 60.00, 'Main Course', 'available', '/images/Container/Crispy Chicken Burger.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Mushroom Swiss Burger', 'Beef patty with sautéed mushrooms and Swiss cheese', 75.00, 'Main Course', 'available', '/images/Container/Mushroom Swiss Burger.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Chicken Caesar Wrap', 'Grilled chicken with romaine, parmesan, and Caesar dressing', 55.00, 'Main Course', 'available', '/images/Container/Chicken Caesar Wrap.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'BBQ Sandwich', 'Slow-cooked pork with BBQ sauce and coleslaw', 70.00, 'Sandwiches', 'unavailable', '/images/Container/BBQ Sandwich.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Mediterranean Quinoa Bowl', 'Quinoa with roasted vegetables, feta, and lemon dressing', 65.00, 'Main Course', 'available', '/images/Container/Mediterranean Quinoa Bowl.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Sweet Potato Fries', 'Crispy sweet potato fries with chipotle mayo', 30.00, 'Sides', 'available', '/images/Container/Sweet Potato Fries.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Loaded Nachos', 'Tortilla chips with cheese, jalapeños, and sour cream', 45.00, 'Sides', 'available', '/images/Container/Loaded Nachos.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Iced Coffee', 'Cold brew coffee with milk', 25.00, 'Beverages', 'available', '/images/Container/iced coffe.jpg'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'Chocolate Brownie', 'Rich chocolate brownie with walnuts', 30.00, 'Sides', 'available', '/images/Container/Chocolate Brownie.jpg');

-- =====================================================
-- Essens Menu (Healthy Food)
-- =====================================================
INSERT INTO FoodTruck.MenuItems (truckId, name, description, price, category, status) VALUES
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Grilled Chicken Power Bowl', 'Grilled chicken breast with quinoa, avocado, and mixed greens', 75.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Salmon Poke Bowl', 'Fresh salmon with brown rice, edamame, and sesame dressing', 95.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Vegan Buddha Bowl', 'Roasted chickpeas, sweet potato, kale, and tahini dressing', 65.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Greek Yogurt Parfait', 'Greek yogurt with granola, berries, and honey', 40.00, 'Sides', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Acai Smoothie Bowl', 'Acai berry smoothie topped with fresh fruit and coconut', 55.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Green Detox Juice', 'Kale, cucumber, apple, and ginger juice', 35.00, 'Beverages', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Protein Shake', 'Chocolate or vanilla protein shake with almond milk', 45.00, 'Beverages', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Mixed Berry Smoothie', 'Strawberries, blueberries, banana, and yogurt', 40.00, 'Beverages', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'Avocado Toast', 'Whole grain toast with smashed avocado, eggs, and seeds', 50.00, 'Sides', 'available');

-- =====================================================
-- Ftar w Asha Menu (Egyptian Breakfast/Lunch)
-- =====================================================
INSERT INTO FoodTruck.MenuItems (truckId, name, description, price, category, status) VALUES
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Ful Medames', 'Traditional Egyptian fava beans with olive oil and spices', 30.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Taameya (Egyptian Falafel)', 'Crispy fava bean falafel with tahini and salad', 35.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Shakshuka', 'Poached eggs in spicy tomato sauce with bread', 45.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Koshary', 'Egyptian rice, lentils, pasta, and crispy onions with tomato sauce', 40.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Molokhia with Rice', 'Traditional Egyptian green soup with chicken and rice', 55.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Mahshi (Stuffed Vegetables)', 'Grape leaves and zucchini stuffed with rice and herbs', 50.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Baladi Bread', 'Fresh Egyptian flatbread', 5.00, 'Sides', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Egyptian Tea', 'Traditional black tea', 10.00, 'Beverages', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'Basbousa', 'Sweet semolina cake with syrup', 25.00, 'Sides', 'available');

-- =====================================================
-- Loaded Menu (Loaded Fries/Comfort Food)
-- =====================================================
INSERT INTO FoodTruck.MenuItems (truckId, name, description, price, category, status) VALUES
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Loaded Cheese Fries', 'Crispy fries with melted cheddar, bacon, and jalapeños', 50.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Pulled Beef Loaded Fries', 'Fries topped with slow-cooked beef, cheese sauce, and BBQ drizzle', 70.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Buffalo Chicken Fries', 'Fries with spicy buffalo chicken, ranch, and blue cheese', 65.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Chili Cheese Fries', 'Fries smothered in beef chili and melted cheese', 60.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Nachos Supreme', 'Loaded nachos with beef, cheese, guacamole, and sour cream', 65.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Mac n Cheese Bowl', 'Creamy mac and cheese with crispy breadcrumb topping', 55.00, 'Main Course', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Mozzarella Sticks', '6 crispy mozzarella sticks with marinara sauce', 40.00, 'Sides', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Onion Rings', 'Beer-battered crispy onion rings', 35.00, 'Sides', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Milkshake', 'Chocolate, vanilla, or strawberry milkshake', 35.00, 'Beverages', 'available'),
((SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'Churros', 'Fried dough pastry with chocolate sauce', 30.00, 'Sides', 'available');

-- Populate Truck_Contains_MenuItems junction table
INSERT INTO FoodTruck.Truck_Contains_MenuItems (truckId, itemId, displayOrder, isFeatured)
SELECT 
    m.truckId, 
    m.itemId,
    ROW_NUMBER() OVER (PARTITION BY m.truckId ORDER BY m.itemId) as displayOrder,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY m.truckId ORDER BY m.itemId) <= 2 THEN TRUE ELSE FALSE END as isFeatured
FROM FoodTruck.MenuItems m;

-- Display seed results
SELECT 
    t.truckName AS truck_name,
    COUNT(m.itemId) AS item_count,
    AVG(m.price) AS avg_price,
    MIN(m.price) AS min_price,
    MAX(m.price) AS max_price
FROM FoodTruck.Trucks t
LEFT JOIN FoodTruck.MenuItems m ON t.truckId = m.truckId
GROUP BY t.truckName
ORDER BY t.truckName;

SELECT 'Menu items seeded successfully!' as status;
