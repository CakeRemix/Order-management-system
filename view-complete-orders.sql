-- =====================================================
-- View Complete Order Data in pgAdmin
-- Copy these queries into pgAdmin Query Tool and press F5
-- =====================================================

-- Query 1: View all orders
SELECT * FROM foodtruck.orders 
ORDER BY orderid;

-- Query 2: View all order items
SELECT * FROM foodtruck.orderitems 
ORDER BY orderitemid;

-- Query 3: View order-to-orderitem junction table
SELECT * FROM foodtruck.order_contains_orderitems 
ORDER BY orderid, linenumber;

-- Query 4: View order-to-menuitem junction table
SELECT * FROM foodtruck.order_contains_menuitems 
ORDER BY orderid;

-- Query 5: Complete order view with customer, truck, and items (INNER JOIN)
SELECT 
    o.orderid,
    u.name AS customer_name,
    u.email AS customer_email,
    t.truckname AS truck_name,
    o.orderstatus,
    o.totalprice AS order_total,
    oi.orderitemid,
    oi.name AS item_name,
    oi.quantity,
    oi.price AS item_price,
    ocoi.linenumber
FROM foodtruck.orders o
INNER JOIN foodtruck.users u ON o.userid = u.userid
INNER JOIN foodtruck.trucks t ON o.truckid = t.truckid
INNER JOIN foodtruck.order_contains_orderitems ocoi ON o.orderid = ocoi.orderid
INNER JOIN foodtruck.orderitems oi ON ocoi.orderitemid = oi.orderitemid
ORDER BY o.orderid, ocoi.linenumber;

-- Query 6: Order summary with item count
SELECT 
    o.orderid,
    u.name AS customer,
    t.truckname AS truck,
    o.orderstatus AS status,
    o.totalprice,
    o.createdat,
    COUNT(ocoi.orderitemid) AS item_count
FROM foodtruck.orders o
INNER JOIN foodtruck.users u ON o.userid = u.userid
INNER JOIN foodtruck.trucks t ON o.truckid = t.truckid
LEFT JOIN foodtruck.order_contains_orderitems ocoi ON o.orderid = ocoi.orderid
GROUP BY o.orderid, u.name, t.truckname, o.orderstatus, o.totalprice, o.createdat
ORDER BY o.orderid DESC;
