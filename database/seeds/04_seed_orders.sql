-- =====================================================
-- Seed Data: Sample Orders
-- Schema: FoodTruck
-- =====================================================

-- Clear existing data
TRUNCATE TABLE FoodTruck.Orders CASCADE;
TRUNCATE TABLE FoodTruck.OrderItems CASCADE;
TRUNCATE TABLE FoodTruck.Order_Contains_OrderItems CASCADE;
TRUNCATE TABLE FoodTruck.Order_Contains_MenuItems CASCADE;
TRUNCATE TABLE FoodTruck.User_Track_Order CASCADE;
TRUNCATE TABLE FoodTruck.User_Place_Order CASCADE;
ALTER SEQUENCE FoodTruck.Orders_orderid_seq RESTART WITH 1;
ALTER SEQUENCE FoodTruck.OrderItems_orderitemid_seq RESTART WITH 1;

-- =====================================================
-- Sample Orders from Various Customers
-- =====================================================

-- Order 1: Hassan Yousef - Demeshq - Completed
INSERT INTO FoodTruck.Orders (userId, truckId, orderStatus, totalPrice, scheduledPickupTime, estimatedEarliestPickup, createdAt) 
VALUES (
    (SELECT userId FROM FoodTruck.Users WHERE email = 'hassan.yousef@student.giu-uni.de'),
    (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'),
    'completed',
    90.00,
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    CURRENT_TIMESTAMP - INTERVAL '2 hours 15 minutes',
    CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes'
);

-- Create OrderItems for Order 1
INSERT INTO FoodTruck.OrderItems (name, quantity, price)
VALUES ('Chicken Shawarma Sandwich', 2, 45.00);

-- Link OrderItems to Order 1
INSERT INTO FoodTruck.Order_Contains_OrderItems (orderId, orderItemId, lineNumber)
VALUES (1, 1, 1);

-- Link MenuItems to Order 1
INSERT INTO FoodTruck.Order_Contains_MenuItems (orderId, itemId, quantity, priceAtOrder)
VALUES (1, (SELECT itemId FROM FoodTruck.MenuItems WHERE name = 'Chicken Shawarma Sandwich' LIMIT 1), 2, 45.00);

-- Track order
INSERT INTO FoodTruck.User_Track_Order (userId, orderId, notificationsEnabled)
VALUES ((SELECT userId FROM FoodTruck.Users WHERE email = 'hassan.yousef@student.giu-uni.de'), 1, TRUE);

-- Record order placement
INSERT INTO FoodTruck.User_Place_Order (userId, orderId, placedAt, ipAddress)
VALUES ((SELECT userId FROM FoodTruck.Users WHERE email = 'hassan.yousef@student.giu-uni.de'), 1, 
        CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes', '192.168.1.100');

-- Order 2: Sara Adel - Container - Ready
INSERT INTO FoodTruck.Orders (userId, truckId, orderStatus, totalPrice, scheduledPickupTime, estimatedEarliestPickup, createdAt) 
VALUES (
    (SELECT userId FROM FoodTruck.Users WHERE email = 'sara.adel@student.giu-uni.de'),
    (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'),
    'ready',
    125.00,
    CURRENT_TIMESTAMP + INTERVAL '10 minutes',
    CURRENT_TIMESTAMP + INTERVAL '5 minutes',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
);

INSERT INTO FoodTruck.OrderItems (name, quantity, price)
VALUES 
    ('Classic Beef Burger', 1, 65.00),
    ('Sweet Potato Fries', 2, 30.00);

INSERT INTO FoodTruck.Order_Contains_OrderItems (orderId, orderItemId, lineNumber)
VALUES (2, 2, 1), (2, 3, 2);

INSERT INTO FoodTruck.Order_Contains_MenuItems (orderId, itemId, quantity, priceAtOrder)
VALUES 
    (2, (SELECT itemId FROM FoodTruck.MenuItems WHERE name = 'Classic Beef Burger' LIMIT 1), 1, 65.00),
    (2, (SELECT itemId FROM FoodTruck.MenuItems WHERE name = 'Sweet Potato Fries' LIMIT 1), 2, 30.00);

INSERT INTO FoodTruck.User_Track_Order (userId, orderId, notificationsEnabled)
VALUES ((SELECT userId FROM FoodTruck.Users WHERE email = 'sara.adel@student.giu-uni.de'), 2, TRUE);

INSERT INTO FoodTruck.User_Place_Order (userId, orderId, placedAt, ipAddress)
VALUES ((SELECT userId FROM FoodTruck.Users WHERE email = 'sara.adel@student.giu-uni.de'), 2, 
        CURRENT_TIMESTAMP - INTERVAL '15 minutes', '192.168.1.101');

-- Order 3: Mohamed Walid - Loaded - Pending
INSERT INTO FoodTruck.Orders (userId, truckId, orderStatus, totalPrice, scheduledPickupTime, estimatedEarliestPickup, createdAt) 
VALUES (
    (SELECT userId FROM FoodTruck.Users WHERE email = 'mohamed.walid@student.giu-uni.de'),
    (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'),
    'pending',
    130.00,
    CURRENT_TIMESTAMP + INTERVAL '30 minutes',
    CURRENT_TIMESTAMP + INTERVAL '25 minutes',
    CURRENT_TIMESTAMP - INTERVAL '2 minutes'
);

INSERT INTO FoodTruck.OrderItems (name, quantity, price)
VALUES 
    ('Pulled Beef Loaded Fries', 1, 70.00),
    ('Milkshake', 2, 35.00);

INSERT INTO FoodTruck.Order_Contains_OrderItems (orderId, orderItemId, lineNumber)
VALUES (3, 4, 1), (3, 5, 2);

INSERT INTO FoodTruck.Order_Contains_MenuItems (orderId, itemId, quantity, priceAtOrder)
VALUES 
    (3, (SELECT itemId FROM FoodTruck.MenuItems WHERE name = 'Pulled Beef Loaded Fries' LIMIT 1), 1, 70.00),
    (3, (SELECT itemId FROM FoodTruck.MenuItems WHERE name = 'Milkshake' LIMIT 1), 2, 35.00);

INSERT INTO FoodTruck.User_Track_Order (userId, orderId, notificationsEnabled)
VALUES ((SELECT userId FROM FoodTruck.Users WHERE email = 'mohamed.walid@student.giu-uni.de'), 3, TRUE);

INSERT INTO FoodTruck.User_Place_Order (userId, orderId, placedAt, ipAddress)
VALUES ((SELECT userId FROM FoodTruck.Users WHERE email = 'mohamed.walid@student.giu-uni.de'), 3, 
        CURRENT_TIMESTAMP - INTERVAL '2 minutes', '192.168.1.102');

-- Display seed results
SELECT 
    o.orderId,
    u.name AS customer_name,
    t.truckName AS truck_name,
    o.orderStatus,
    o.totalPrice,
    o.scheduledPickupTime,
    COUNT(oi.orderItemId) AS item_count
FROM FoodTruck.Orders o
JOIN FoodTruck.Users u ON o.userId = u.userId
JOIN FoodTruck.Trucks t ON o.truckId = t.truckId
LEFT JOIN FoodTruck.Order_Contains_OrderItems ocoi ON o.orderId = ocoi.orderId
LEFT JOIN FoodTruck.OrderItems oi ON ocoi.orderItemId = oi.orderItemId
GROUP BY o.orderId, u.name, t.truckName
ORDER BY o.orderId;

SELECT 'Orders seeded successfully!' as status;

-- =====================================================
-- Sample Orders from Various Customers
-- =====================================================

-- Order 1: Hassan Yousef - Demeshq - Completed
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, actual_completion_time, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'hassan.yousef@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Demeshq'),
    'completed',
    90.00,
    0.00,
    90.00,
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    15,
    CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes',
    TRUE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (1, (SELECT id FROM menu_items WHERE name = 'Chicken Shawarma Sandwich' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Chicken Shawarma Sandwich', 1, 45.00, 45.00),
    (1, (SELECT id FROM menu_items WHERE name = 'Chicken Shawarma Sandwich' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Chicken Shawarma Sandwich', 1, 45.00, 45.00);

-- Order 2: Sara Adel - Container - Ready for pickup
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'sara.adel@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Container'),
    'ready',
    125.00,
    0.00,
    125.00,
    CURRENT_TIMESTAMP + INTERVAL '10 minutes',
    20,
    FALSE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (2, (SELECT id FROM menu_items WHERE name = 'Classic Beef Burger' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Container')), 'Classic Beef Burger', 1, 65.00, 65.00),
    (2, (SELECT id FROM menu_items WHERE name = 'Sweet Potato Fries' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Container')), 'Sweet Potato Fries', 2, 30.00, 60.00);

-- Order 3: Hana Yasser - Essens - Preparing
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, notes, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'hana.yasser@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Essens'),
    'preparing',
    135.00,
    0.00,
    135.00,
    CURRENT_TIMESTAMP + INTERVAL '25 minutes',
    12,
    'No onions please',
    FALSE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '8 minutes'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal, special_instructions)
VALUES 
    (3, (SELECT id FROM menu_items WHERE name = 'Grilled Chicken Power Bowl' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Essens')), 'Grilled Chicken Power Bowl', 1, 75.00, 75.00, 'No onions'),
    (3, (SELECT id FROM menu_items WHERE name = 'Green Detox Juice' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Essens')), 'Green Detox Juice', 1, 35.00, 35.00, NULL),
    (3, (SELECT id FROM menu_items WHERE name = 'Greek Yogurt Parfait' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Essens')), 'Greek Yogurt Parfait', 1, 40.00, 40.00, 'Extra berries if possible');

-- Order 4: Mohamed Walid - Ftar w Asha - Received
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'mohamed.walid@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Ftar w Asha'),
    'received',
    95.00,
    0.00,
    95.00,
    CURRENT_TIMESTAMP + INTERVAL '30 minutes',
    18,
    FALSE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '2 minutes'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (4, (SELECT id FROM menu_items WHERE name = 'Koshary' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Ftar w Asha')), 'Koshary', 1, 40.00, 40.00),
    (4, (SELECT id FROM menu_items WHERE name = 'Molokhia with Rice' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Ftar w Asha')), 'Molokhia with Rice', 1, 55.00, 55.00);

-- Order 5: Omar Hani - Loaded - Preparing
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'omar.hani@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Loaded'),
    'preparing',
    115.00,
    0.00,
    115.00,
    CURRENT_TIMESTAMP + INTERVAL '20 minutes',
    25,
    FALSE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '10 minutes'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (5, (SELECT id FROM menu_items WHERE name = 'Pulled Beef Loaded Fries' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Loaded')), 'Pulled Beef Loaded Fries', 1, 70.00, 70.00),
    (5, (SELECT id FROM menu_items WHERE name = 'Mozzarella Sticks' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Loaded')), 'Mozzarella Sticks', 1, 40.00, 40.00);

-- Order 6: Khaled Khaled - Demeshq - Received
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'khaled.khaled@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Demeshq'),
    'received',
    160.00,
    0.00,
    160.00,
    CURRENT_TIMESTAMP + INTERVAL '35 minutes',
    15,
    FALSE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '1 minute'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (6, (SELECT id FROM menu_items WHERE name = 'Mixed Grill Plate' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Mixed Grill Plate', 1, 120.00, 120.00),
    (6, (SELECT id FROM menu_items WHERE name = 'Fattoush Salad' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Fattoush Salad', 1, 40.00, 40.00);

-- Order 7: Ali Ahmed - Container - Ready
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'ali.ahmed@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Container'),
    'ready',
    145.00,
    0.00,
    145.00,
    CURRENT_TIMESTAMP + INTERVAL '5 minutes',
    20,
    FALSE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '18 minutes'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (7, (SELECT id FROM menu_items WHERE name = 'Mushroom Swiss Burger' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Container')), 'Mushroom Swiss Burger', 1, 75.00, 75.00),
    (7, (SELECT id FROM menu_items WHERE name = 'Mediterranean Quinoa Bowl' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Container')), 'Mediterranean Quinoa Bowl', 1, 65.00, 65.00);

-- Order 8: Nour Hassan - Essens - Completed (from yesterday)
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, actual_completion_time, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'nour.hassan@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Essens'),
    'completed',
    150.00,
    0.00,
    150.00,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    12,
    CURRENT_TIMESTAMP - INTERVAL '23 hours 40 minutes',
    TRUE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (8, (SELECT id FROM menu_items WHERE name = 'Salmon Poke Bowl' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Essens')), 'Salmon Poke Bowl', 1, 95.00, 95.00),
    (8, (SELECT id FROM menu_items WHERE name = 'Acai Smoothie Bowl' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Essens')), 'Acai Smoothie Bowl', 1, 55.00, 55.00);

-- Order 9: Youssef Ibrahim - Loaded - Cancelled
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, cancellation_reason, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'youssef.ibrahim@student.giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Loaded'),
    'cancelled',
    85.00,
    0.00,
    85.00,
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    25,
    'Customer requested cancellation - change of plans',
    FALSE,
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (9, (SELECT id FROM menu_items WHERE name = 'Buffalo Chicken Fries' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Loaded')), 'Buffalo Chicken Fries', 1, 65.00, 65.00),
    (9, (SELECT id FROM menu_items WHERE name = 'Fresh Lemonade' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Fresh Lemonade', 1, 20.00, 20.00);

-- Order 10: Dr. Ahmed Refaat (Staff) - Demeshq - Ready
INSERT INTO orders (customer_id, food_truck_id, status, subtotal, tax, total, pickup_time, estimated_prep_time, is_paid, payment_method, created_at) 
VALUES (
    (SELECT id FROM users WHERE email = 'ahmed.refaat@giu-uni.de'),
    (SELECT id FROM food_trucks WHERE name = 'Demeshq'),
    'ready',
    255.00,
    0.00,
    255.00,
    CURRENT_TIMESTAMP + INTERVAL '8 minutes',
    15,
    FALSE,
    'cash',
    CURRENT_TIMESTAMP - INTERVAL '12 minutes'
);

INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal, special_instructions)
VALUES 
    (10, (SELECT id FROM menu_items WHERE name = 'Beef Shawarma Plate' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Beef Shawarma Plate', 2, 85.00, 170.00, 'Extra tahini sauce'),
    (10, (SELECT id FROM menu_items WHERE name = 'Hummus Bowl' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Hummus Bowl', 1, 30.00, 30.00, NULL),
    (10, (SELECT id FROM menu_items WHERE name = 'Fattoush Salad' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Fattoush Salad', 1, 40.00, 40.00, NULL),
    (10, (SELECT id FROM menu_items WHERE name = 'Baklava' AND food_truck_id = (SELECT id FROM food_trucks WHERE name = 'Demeshq')), 'Baklava', 1, 25.00, 25.00, NULL);

-- Display seed results
SELECT 
    o.order_number,
    u.name AS customer,
    ft.name AS truck,
    o.status,
    o.total,
    TO_CHAR(o.pickup_time, 'YYYY-MM-DD HH24:MI') AS pickup_time,
    COUNT(oi.id) AS items_count
FROM orders o
JOIN users u ON o.customer_id = u.id
JOIN food_trucks ft ON o.food_truck_id = ft.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, u.name, ft.name, o.status, o.total, o.pickup_time
ORDER BY o.created_at DESC;

-- Statistics
SELECT 
    o.status,
    COUNT(*) AS order_count,
    SUM(o.total) AS total_revenue
FROM orders o
GROUP BY o.status
ORDER BY o.status;

SELECT 'Sample orders seeded successfully!' as status;
