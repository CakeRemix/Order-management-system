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
    const { userId, truckId, totalPrice, orderStatus = 'received', scheduledPickupTime } = orderData;
    
    // Generate order number (max 20 chars)
    const orderNumber = `ORD${Date.now().toString().slice(-10)}`;
    
    // Calculate pickup time: use scheduled time or default to 30 minutes from now
    const pickupTime = scheduledPickupTime || db.raw("NOW() + INTERVAL '30 minutes'");
    
    const [result] = await db('foodtruck.orders')
        .insert({
            userid: userId,
            truckid: truckId,
            orderstatus: orderStatus,
            totalprice: totalPrice,
            scheduledpickuptime: pickupTime,
            createdat: db.raw('NOW()')
        })
        .returning('*');
    
    return result;
};

/**
 * Creates order items for a specific order
 * @param {number} orderId - The order ID  
 * @param {Array} items - Array of { itemId, name, quantity, price }
 * @returns {Promise<Array>} - Array of created order items
 */
const createOrderItems = async (orderId, items) => {
    const orderItems = [];
    
    for (const item of items) {
        const unitPrice = parseFloat(item.price);
        
        // First, create the order item
        const [orderItem] = await db('foodtruck.orderitems')
            .insert({
                name: item.name,
                quantity: item.quantity,
                price: unitPrice,
                createdat: db.raw('NOW()')
            })
            .returning('*');
        
        // Then, link it to the order via junction table
        await db('foodtruck.order_contains_orderitems')
            .insert({
                orderid: orderId,
                orderitemid: orderItem.orderitemid,
                linenumber: orderItems.length + 1,
                createdat: db.raw('NOW()')
            });
        
        orderItems.push(orderItem);
    }
    
    return orderItems;
};

/**
 * Gets an order by ID with all its items
 * @param {number} orderId - The order ID
 * @returns {Promise<Object>} - Order with items
 */
const getOrderById = async (orderId) => {
    const order = await db('foodtruck.orders as o')
        .select(
            'o.*',
            'u.name as customer_name',
            'u.email as customer_email',
            't.truckname as truck_name'
        )
        .join('foodtruck.users as u', 'o.userid', 'u.userid')
        .join('foodtruck.trucks as t', 'o.truckid', 't.truckid')
        .where('o.orderid', orderId)
        .first();
    
    if (!order) {
        return null;
    }
    
    // Get order items through the junction table
    const items = await db('foodtruck.orderitems as oi')
        .select('oi.*', 'oco.linenumber')
        .join('foodtruck.order_contains_orderitems as oco', 'oi.orderitemid', 'oco.orderitemid')
        .where('oco.orderid', orderId)
        .orderBy('oco.linenumber');
    
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
        .select('o.*', 't.truckname as truck_name')
        .join('foodtruck.trucks as t', 'o.truckid', 't.truckid')
        .where('o.userid', userId)
        .orderBy('o.createdat', 'desc');
    
    return orders;
};

/**
 * Gets orders by truck ID with optional status filter
 * @param {number} truckId - The truck ID
 * @param {Array} statuses - Optional array of statuses to filter
 * @returns {Promise<Array>} - Array of orders
 */
const getOrdersByTruckId = async (truckId, statuses = null) => {
    let query = db('public.orders as o')
        .select(
            'o.*',
            'u.name as customer_name',
            'u.email as customer_email'
        )
        .join('public.users as u', 'o.customer_id', 'u.id')
        .where('o.food_truck_id', truckId);
    
    if (statuses && statuses.length > 0) {
        query = query.whereIn('o.status', statuses);
    }
    
    return await query.orderBy('o.created_at', 'desc');
};

/**
 * Gets new orders for vendor (pending, preparing, ready statuses)
 * @param {number} ownerId - The vendor/owner ID
 * @returns {Promise<Array>} - Array of orders with full details
 */
const getNewOrdersForVendor = async (ownerId) => {
    // Get all trucks owned by this vendor
    const trucks = await db('public.food_trucks')
        .select('id')
        .where('owner_id', ownerId);
    
    if (trucks.length === 0) {
        return [];
    }
    
    const truckIds = trucks.map(truck => truck.id);
    
    // Get orders with pending, preparing, or ready status
    const orders = await db('public.orders as o')
        .select(
            'o.*',
            'u.name as customer_name',
            'u.email as customer_email',
            'u.phone_number as customer_phone',
            't.name as truck_name'
        )
        .join('public.users as u', 'o.customer_id', 'u.id')
        .join('public.food_trucks as t', 'o.food_truck_id', 't.id')
        .whereIn('o.food_truck_id', truckIds)
        .whereIn('o.status', ['pending', 'preparing', 'ready'])
        .orderBy('o.created_at', 'desc');
    
    // Get items for each order
    for (const order of orders) {
        const items = await db('public.order_items')
            .select('*')
            .where('order_id', order.id)
            .orderBy('id');
        
        order.items = items;
    }
    
    return orders;
};

/**
 * Updates order status
 * @param {number} orderId - The order ID
 * @param {string} status - New status (pending, preparing, ready, completed, cancelled)
 * @returns {Promise<Object>} - Updated order
 */
const updateOrderStatus = async (orderId, status) => {
    const [updatedOrder] = await db('public.orders')
        .where('id', orderId)
        .update({
            status: status,
            updated_at: db.raw('NOW()')
        })
        .returning('*');
    
    return updatedOrder;
};

module.exports = {
    createOrder,
    createOrderItems,
    getOrderById,
    getOrdersByUserId,
    getOrdersByTruckId,
    getNewOrdersForVendor,
    updateOrderStatus
};
