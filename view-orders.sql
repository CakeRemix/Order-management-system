-- =====================================================
-- View Orders in pgAdmin
-- Copy and paste these queries into pgAdmin Query Tool
-- =====================================================

-- 1. View all orders
SELECT * FROM foodtruck.orders;

-- 2. View all order items
SELECT * FROM foodtruck.orderitems;

-- 3. View orders with customer and truck names
SELECT 
    o.orderid,
    u.name AS customer_name,
    u.email AS customer_email,
    t.truckname AS truck_name,
    o.totalprice,
    o.orderstatus,
    o.createdat
FROM foodtruck.orders o
JOIN foodtruck.users u ON o.userid = u.userid
JOIN foodtruck.trucks t ON o.truckid = t.truckid
ORDER BY o.createdat DESC;

-- 4. View complete order details with items
SELECT 
    o.orderid,
    u.name AS customer,
    t.truckname AS truck,
    oi.name AS item_name,
    oi.quantity,
    oi.price,
    o.totalprice AS order_total,
    o.orderstatus
FROM foodtruck.orders o
JOIN foodtruck.users u ON o.userid = u.userid
JOIN foodtruck.trucks t ON o.truckid = t.truckid
LEFT JOIN foodtruck.orderitems oi ON oi.orderitemid IN (1,2,3,4)
ORDER BY o.orderid, oi.orderitemid;
