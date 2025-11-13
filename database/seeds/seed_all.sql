-- =====================================================
-- Master Seed Script
-- Runs all seed files in order
-- =====================================================

\echo '==================================================='
\echo 'Starting database seeding...'
\echo '==================================================='

-- Seed users
\echo '\nSeeding users...'
\i 01_seed_users.sql

-- Seed food trucks
\echo '\nSeeding food trucks...'
\i 02_seed_food_trucks.sql

-- Seed menu items
\echo '\nSeeding menu items...'
\i 03_seed_menu_items.sql

-- Seed orders
\echo '\nSeeding orders...'
\i 04_seed_orders.sql

\echo '\n==================================================='
\echo 'Database seeding completed!'
\echo '==================================================='

-- Final statistics
\echo '\nDatabase Statistics:'
\echo '-------------------'

SELECT 'Total Users: ' || COUNT(*) FROM users;
SELECT 'Total Food Trucks: ' || COUNT(*) FROM food_trucks;
SELECT 'Total Menu Items: ' || COUNT(*) FROM menu_items;
SELECT 'Total Orders: ' || COUNT(*) FROM orders;
SELECT 'Total Order Items: ' || COUNT(*) FROM order_items;
