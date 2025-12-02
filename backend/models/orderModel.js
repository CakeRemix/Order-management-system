const db = require('../config/db');

/**
 * Order Model
 * Handles all database operations for orders
 */

/**
 * Creates a new order in the database
 * @param {Object} orderData - { userId, truckId, totalPrice, orderStatus, scheduledPickupTime }
 * @returns {Promise<Object>} - Created order with orderId
 */
const createOrder = async (orderData) => {
    const { userId, truckId, totalPrice, orderStatus = 'pending', scheduledPickupTime } = orderData;
    
    const [result] = await db('foodtruck.orders')
        .insert({
            userid: userId,
            truckid: truckId,
            totalprice: totalPrice,
            orderstatus: orderStatus,
            scheduledpickuptime: scheduledPickupTime || null,
            estimatedearliestpickup: db.raw("NOW() + INTERVAL '30 minutes'"),
            createdat: db.raw('NOW()')
        })
        .returning('*');
    
    return result;
};

/**
 * Creates order items for a specific order
 * Uses your schema's junction table pattern (Order_Contains_OrderItems)
 * @param {number} orderId - The order ID  
 * @param {Array} items - Array of { itemId, name, quantity, price }
 * @returns {Promise<Array>} - Array of created order items
 */
const createOrderItems = async (orderId, items) => {
    const orderItems = [];
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Step 1: Create OrderItem (standalone)
        const [result] = await db('foodtruck.orderitems')
            .insert({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                createdat: db.raw('NOW()')
            })
            .returning('*');
        
        orderItems.push(result);
        
        // Step 2: Link OrderItem to Order via junction table
        await db('foodtruck.order_contains_orderitems')
            .insert({
                orderid: orderId,
                orderitemid: result.orderitemid,
                linenumber: i + 1,
                createdat: db.raw('NOW()')
            });
        
        // Step 3: Link Order to MenuItem via junction table  
        await db('foodtruck.order_contains_menuitems')
            .insert({
                orderid: orderId,
                itemid: item.itemId,
                quantity: item.quantity,
                priceatorder: item.price
            });
    }
    
    return orderItems;
};

/**
 * Gets an order by ID with all its items
 * Uses junction table to retrieve linked order items (INNER JOIN)
 * @param {number} orderId - The order ID
 * @returns {Promise<Object>} - Order with items
 */
const getOrderById = async (orderId) => {
    const order = await db('foodtruck.orders as o')
        .select(
            'o.*',
            'u.name as customername',
            'u.email',
            't.truckname'
        )
        .join('foodtruck.users as u', 'o.userid', 'u.userid')
        .join('foodtruck.trucks as t', 'o.truckid', 't.truckid')
        .where('o.orderid', orderId)
        .first();
    
    if (!order) {
        return null;
    }
    
    // Get OrderItems via junction table (matches Milestone3 INNER JOIN pattern)
    const items = await db('foodtruck.orderitems as oi')
        .select(
            'oi.orderitemid',
            'oi.name',
            'oi.quantity',
            'oi.price',
            'ocoi.linenumber'
        )
        .join('foodtruck.order_contains_orderitems as ocoi', 'oi.orderitemid', 'ocoi.orderitemid')
        .where('ocoi.orderid', orderId)
        .orderBy('ocoi.linenumber');
    
    order.items = items;
    
    return order;
};

/**
 * Gets all orders for a specific user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} - Array of orders
 */
const getOrdersByUserId = async (userId) => {
    const orders = await db('foodtruck.orders as o')
        .select('o.*', 't.truckname')
        .join('foodtruck.trucks as t', 'o.truckid', 't.truckid')
        .where('o.userid', userId)
        .orderBy('o.createdat', 'desc');
    
    return orders;
};

module.exports = {
    createOrder,
    createOrderItems,
    getOrderById,
    getOrdersByUserId
};
