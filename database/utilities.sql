-- =====================================================
-- Database Utilities
-- Common maintenance and utility queries
-- =====================================================

-- =====================================================
-- 1. DATABASE HEALTH CHECK
-- =====================================================

\echo '=== Database Health Check ==='
\echo ''

-- Check all tables exist
\echo 'Tables in database:'
SELECT tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo 'Record counts:'
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'food_trucks', COUNT(*) FROM food_trucks
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;

-- =====================================================
-- 2. RESET ORDER STATUSES (for testing)
-- =====================================================

-- Reset all orders to 'received' status for testing
-- UNCOMMENT TO USE:
-- UPDATE orders SET status = 'received' WHERE status != 'completed';

-- =====================================================
-- 3. CLEAN OLD COMPLETED ORDERS
-- =====================================================

-- Delete orders completed more than 30 days ago
-- UNCOMMENT TO USE:
-- DELETE FROM orders 
-- WHERE status = 'completed' 
-- AND actual_completion_time < CURRENT_TIMESTAMP - INTERVAL '30 days';

-- =====================================================
-- 4. UPDATE FOOD TRUCK STATUS
-- =====================================================

-- Open all trucks for testing
-- UNCOMMENT TO USE:
-- UPDATE food_trucks SET status = 'open', is_busy = FALSE WHERE is_active = TRUE;

-- Close all trucks
-- UNCOMMENT TO USE:
-- UPDATE food_trucks SET status = 'closed' WHERE is_active = TRUE;

-- =====================================================
-- 5. RESET MENU ITEM AVAILABILITY
-- =====================================================

-- Make all menu items available
-- UNCOMMENT TO USE:
-- UPDATE menu_items SET is_available = TRUE WHERE is_active = TRUE;

-- =====================================================
-- 6. GENERATE PASSWORD HASH (bcrypt)
-- =====================================================

\echo ''
\echo 'Default test password hash (Test123!):'
\echo '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
\echo ''
\echo 'Use this hash for testing new users'

-- =====================================================
-- 7. STATISTICS QUERIES
-- =====================================================

\echo ''
\echo '=== System Statistics ==='
\echo ''

-- Orders by status
\echo 'Orders by status:'
SELECT status, COUNT(*) AS count, SUM(total) AS revenue
FROM orders
GROUP BY status
ORDER BY status;

\echo ''
\echo 'Top selling menu items:'
SELECT 
    mi.name,
    ft.name AS truck,
    SUM(oi.quantity) AS times_ordered,
    SUM(oi.subtotal) AS total_revenue
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN food_trucks ft ON mi.food_truck_id = ft.id
GROUP BY mi.id, mi.name, ft.name
ORDER BY times_ordered DESC
LIMIT 10;

\echo ''
\echo 'Revenue by food truck:'
SELECT 
    ft.name AS truck,
    COUNT(o.id) AS total_orders,
    SUM(o.total) AS total_revenue,
    AVG(o.total) AS avg_order_value
FROM food_trucks ft
LEFT JOIN orders o ON ft.id = o.food_truck_id
WHERE o.status != 'cancelled'
GROUP BY ft.id, ft.name
ORDER BY total_revenue DESC;

\echo ''
\echo 'Top customers:'
SELECT 
    u.name,
    u.email,
    COUNT(o.id) AS order_count,
    SUM(o.total) AS total_spent
FROM users u
JOIN orders o ON u.id = o.customer_id
WHERE o.status != 'cancelled'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC
LIMIT 10;

-- =====================================================
-- 8. FIND ORPHANED RECORDS
-- =====================================================

\echo ''
\echo '=== Checking for orphaned records ==='

-- Users without any orders (inactive customers)
SELECT COUNT(*) AS inactive_customers
FROM users u
WHERE u.role = 'customer'
AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = u.id);

-- Menu items never ordered
SELECT COUNT(*) AS never_ordered_items
FROM menu_items mi
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.menu_item_id = mi.id);

-- Food trucks with no menu items
SELECT COUNT(*) AS trucks_without_menu
FROM food_trucks ft
WHERE NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.food_truck_id = ft.id);

-- =====================================================
-- 9. VALIDATE DATA INTEGRITY
-- =====================================================

\echo ''
\echo '=== Data Integrity Checks ==='

-- Orders with mismatched totals
SELECT COUNT(*) AS orders_with_total_mismatch
FROM orders o
WHERE o.subtotal != (
    SELECT COALESCE(SUM(oi.subtotal), 0)
    FROM order_items oi
    WHERE oi.order_id = o.id
);

-- Orders without items
SELECT COUNT(*) AS orders_without_items
FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
);

\echo ''
\echo '=== Health Check Complete ==='
