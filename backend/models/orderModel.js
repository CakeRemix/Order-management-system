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
    
    const [result] = await db('public.orders')
        .insert({
            customer_id: userId,
            food_truck_id: truckId,
            order_number: orderNumber,
            status: orderStatus,
            subtotal: totalPrice,
            tax: 0, // No tax for now
            total: totalPrice,
            pickup_time: pickupTime,
            estimated_prep_time: 20, // Default 20 minutes
            is_paid: false,
            created_at: db.raw('NOW()'),
            updated_at: db.raw('NOW()')
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
        const subtotal = unitPrice * item.quantity;
        
        const [result] = await db('public.order_items')
            .insert({
                order_id: orderId,
                menu_item_id: item.itemId,
                item_name: item.name,
                quantity: item.quantity,
                unit_price: unitPrice,
                subtotal: subtotal,
                created_at: db.raw('NOW()')
            })
            .returning('*');
        
        orderItems.push(result);
    }
    
    return orderItems;
};

/**
 * Gets an order by ID with all its items
 * @param {number} orderId - The order ID
 * @returns {Promise<Object>} - Order with items
 */
const getOrderById = async (orderId) => {
    const order = await db('public.orders as o')
        .select(
            'o.*',
            'u.name as customer_name',
            'u.email as customer_email',
            't.name as truck_name'
        )
        .join('public.users as u', 'o.customer_id', 'u.id')
        .join('public.food_trucks as t', 'o.food_truck_id', 't.id')
        .where('o.id', orderId)
        .first();
    
    if (!order) {
        return null;
    }
    
    // Get order items
    const items = await db('public.order_items')
        .select('*')
        .where('order_id', orderId)
        .orderBy('id');
    
    order.items = items;
    
    return order;
};

/**
 * Gets all orders for a specific user
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} - Array of orders
 */
const getOrdersByUserId = async (userId) => {
    const orders = await db('public.orders as o')
        .select('o.*', 't.name as truck_name')
        .join('public.food_trucks as t', 'o.food_truck_id', 't.id')
        .where('o.customer_id', userId)
        .orderBy('o.created_at', 'desc');
    
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
