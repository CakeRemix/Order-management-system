-- =====================================================
-- API Query Examples
-- Copy these into your backend controllers
-- =====================================================

-- =====================================================
-- USER QUERIES
-- =====================================================

-- Register new user
INSERT INTO users (name, email, password, role) 
VALUES ($1, $2, $3, $4) 
RETURNING id, name, email, role, created_at;

-- Login - Find user by email
SELECT id, name, email, password, role, is_active 
FROM users 
WHERE email = $1 AND is_active = TRUE;

-- Get user profile
SELECT id, name, email, role, phone, created_at, last_login 
FROM users 
WHERE id = $1;

-- Update user profile
UPDATE users 
SET name = COALESCE($1, name),
    phone = COALESCE($2, phone),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $3
RETURNING id, name, email, phone;

-- Update last login
UPDATE users 
SET last_login = CURRENT_TIMESTAMP 
WHERE id = $1;

-- =====================================================
-- FOOD TRUCK QUERIES
-- =====================================================

-- Get all active food trucks
SELECT 
    id, name, description, location, image_url, 
    status, is_busy, busy_until, prep_time_minutes
FROM food_trucks 
WHERE is_active = TRUE
ORDER BY name;

-- Get food truck by ID
SELECT 
    ft.*,
    u.name AS vendor_name,
    u.email AS vendor_email
FROM food_trucks ft
LEFT JOIN users u ON ft.vendor_id = u.id
WHERE ft.id = $1 AND ft.is_active = TRUE;

-- Check if truck can accept orders
SELECT can_truck_accept_orders($1) AS can_accept;

-- Update truck status (vendor)
UPDATE food_trucks 
SET status = $1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $2 AND vendor_id = $3
RETURNING id, name, status;

-- Toggle busy mode (vendor)
UPDATE food_trucks 
SET is_busy = $1,
    busy_until = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $3 AND vendor_id = $4
RETURNING id, name, is_busy, busy_until;

-- =====================================================
-- MENU ITEM QUERIES
-- =====================================================

-- Get menu items for a food truck
SELECT 
    id, name, description, price, category,
    prep_time_minutes, is_available, stock_quantity,
    image_url, calories, allergens
FROM menu_items
WHERE food_truck_id = $1 
    AND is_active = TRUE
ORDER BY category, name;

-- Get single menu item
SELECT * FROM menu_items_with_truck
WHERE id = $1 AND is_active = TRUE;

-- Add menu item (vendor)
INSERT INTO menu_items (
    food_truck_id, name, description, price, 
    category, prep_time_minutes, allergens
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- Update menu item (vendor)
UPDATE menu_items
SET name = COALESCE($1, name),
    description = COALESCE($2, description),
    price = COALESCE($3, price),
    category = COALESCE($4, category),
    prep_time_minutes = COALESCE($5, prep_time_minutes),
    is_available = COALESCE($6, is_available),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $7 
    AND food_truck_id = (
        SELECT id FROM food_trucks 
        WHERE id = $8 AND vendor_id = $9
    )
RETURNING *;

-- Toggle item availability (vendor)
UPDATE menu_items
SET is_available = $1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $2
    AND food_truck_id IN (
        SELECT id FROM food_trucks WHERE vendor_id = $3
    )
RETURNING id, name, is_available;

-- Delete menu item (soft delete)
UPDATE menu_items
SET is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
    AND food_truck_id IN (
        SELECT id FROM food_trucks WHERE vendor_id = $2
    )
RETURNING id;

-- =====================================================
-- ORDER QUERIES
-- =====================================================

-- Create new order (returns order_id)
INSERT INTO orders (
    customer_id, food_truck_id, 
    subtotal, tax, total,
    pickup_time, estimated_prep_time, notes
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id, order_number, created_at;

-- Add order items (batch insert)
INSERT INTO order_items (
    order_id, menu_item_id, item_name,
    quantity, unit_price, subtotal,
    special_instructions
)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- Get customer's orders
SELECT 
    o.id, o.order_number, o.status, o.total,
    o.pickup_time, o.created_at,
    ft.name AS truck_name,
    ft.location AS truck_location,
    COUNT(oi.id) AS item_count
FROM orders o
JOIN food_trucks ft ON o.food_truck_id = ft.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.customer_id = $1
GROUP BY o.id, ft.name, ft.location
ORDER BY o.created_at DESC
LIMIT $2 OFFSET $3;

-- Get single order with details
SELECT 
    o.*,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    ft.name AS truck_name,
    ft.location AS truck_location
FROM orders o
JOIN users c ON o.customer_id = c.id
JOIN food_trucks ft ON o.food_truck_id = ft.id
WHERE o.id = $1;

-- Get order items
SELECT 
    oi.*,
    mi.description,
    mi.image_url
FROM order_items oi
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE oi.order_id = $1
ORDER BY oi.id;

-- Get vendor's orders
SELECT 
    o.id, o.order_number, o.status, o.total,
    o.pickup_time, o.created_at, o.notes,
    c.name AS customer_name,
    c.phone AS customer_phone,
    COUNT(oi.id) AS item_count
FROM orders o
JOIN users c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.food_truck_id = $1
    AND o.status IN ('received', 'preparing', 'ready')
GROUP BY o.id, c.name, c.phone
ORDER BY o.pickup_time;

-- Update order status (vendor)
UPDATE orders
SET status = $1,
    updated_at = CURRENT_TIMESTAMP,
    actual_completion_time = CASE 
        WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP 
        ELSE actual_completion_time 
    END
WHERE id = $2
    AND food_truck_id IN (
        SELECT id FROM food_trucks WHERE vendor_id = $3
    )
RETURNING id, order_number, status;

-- Cancel order (customer - only if not preparing)
UPDATE orders
SET status = 'cancelled',
    cancellation_reason = $1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $2
    AND customer_id = $3
    AND status = 'received'
RETURNING id, order_number, status;

-- Get active orders view
SELECT * FROM active_orders_view
WHERE customer_id = $1
ORDER BY pickup_time;

-- =====================================================
-- STATISTICS QUERIES
-- =====================================================

-- Vendor dashboard stats
SELECT * FROM vendor_stats
WHERE truck_id = $1;

-- Today's order count for truck
SELECT COUNT(*) AS today_orders
FROM orders
WHERE food_truck_id = $1
    AND DATE(created_at) = CURRENT_DATE
    AND status != 'cancelled';

-- Peak hours analysis
SELECT 
    EXTRACT(HOUR FROM pickup_time) AS hour,
    COUNT(*) AS order_count
FROM orders
WHERE food_truck_id = $1
    AND created_at > CURRENT_DATE - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;

-- Customer order history stats
SELECT 
    COUNT(*) AS total_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders,
    SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) AS total_spent
FROM orders
WHERE customer_id = $1;

-- =====================================================
-- ADMIN QUERIES
-- =====================================================

-- Get all users with role filter
SELECT 
    id, name, email, role, phone, 
    is_active, created_at, last_login
FROM users
WHERE ($1::user_role IS NULL OR role = $1)
ORDER BY created_at DESC;

-- Add food truck (admin)
INSERT INTO food_trucks (
    name, description, location, 
    vendor_id, prep_time_minutes, operating_hours
)
VALUES ($1, $2, $3, $4, $5, $6::jsonb)
RETURNING *;

-- Delete/deactivate food truck (admin)
UPDATE food_trucks
SET is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, name;

-- Platform statistics (admin)
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
    (SELECT COUNT(*) FROM users WHERE role = 'vendor') AS total_vendors,
    (SELECT COUNT(*) FROM food_trucks WHERE is_active = TRUE) AS active_trucks,
    (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) AS today_orders,
    (SELECT SUM(total) FROM orders WHERE status != 'cancelled') AS total_revenue;

-- =====================================================
-- TRANSACTION EXAMPLE
-- =====================================================

-- Creating an order with items (use in a transaction)
/*
BEGIN;

-- 1. Insert order
INSERT INTO orders (customer_id, food_truck_id, subtotal, tax, total, pickup_time)
VALUES (1, 1, 100.00, 0.00, 100.00, '2025-11-13 13:00:00+00')
RETURNING id;

-- 2. Insert order items (use returned order id)
INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal)
VALUES 
    (1, 1, 'Chicken Shawarma', 2, 45.00, 90.00),
    (1, 8, 'Fresh Lemonade', 1, 20.00, 20.00);

-- 3. Update menu item stock (if tracked)
UPDATE menu_items 
SET stock_quantity = stock_quantity - 2
WHERE id = 1 AND stock_quantity IS NOT NULL;

COMMIT;
*/
