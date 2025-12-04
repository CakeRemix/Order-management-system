const db = require('../config/db');
const preparationEstimator = require('../services/preparationTimeEstimator');

/**
 * Order Model
 * Handles all database operations for orders
 * Enhanced with intelligent preparation time estimation
 */

/**
 * Creates a new order in the database with auto-estimated preparation time
 * @param {Object} orderData - { userId, truckId, totalPrice, orderStatus, scheduledPickupTime, items }
 * @returns {Promise<Object>} - Created order with orderId and estimation data
 */
const createOrder = async (orderData) => {
    const { userId, truckId, totalPrice, orderStatus = 'received', scheduledPickupTime, items = [] } = orderData;
    
    // Generate order number (max 20 chars)
    const orderNumber = `ORD${Date.now().toString().slice(-10)}`;
    
    // Calculate intelligent preparation time estimate
    let estimatedMinutes = 20; // Fallback default
    let estimatedCompletionTime = null;
    let estimationBreakdown = null;
    
    // Auto-estimate preparation time when items are provided
    if (items && items.length > 0) {
        try {
            // Enrich items with preparation metadata from menu
            const enrichedItems = await preparationEstimator.enrichItemsWithPreparationData(items);
            
            // Calculate intelligent estimate based on items, complexity, and queue
            const estimation = await preparationEstimator.estimatePreparationTime(enrichedItems, truckId);
            
            estimatedMinutes = estimation.estimatedMinutes;
            estimatedCompletionTime = estimation.estimatedCompletionTime;
            estimationBreakdown = estimation.breakdown;
            
            console.log('✅ Auto-estimated preparation time:', {
                orderId: orderNumber,
                estimatedMinutes: `${estimatedMinutes} minutes`,
                completionTime: estimatedCompletionTime,
                hasScheduledTime: !!scheduledPickupTime,
                breakdown: estimationBreakdown
            });
        } catch (error) {
            console.error('⚠️ Error during preparation estimation, using fallback:', error);
            // Calculate fallback completion time based on default minutes
            const fallbackDate = new Date();
            fallbackDate.setMinutes(fallbackDate.getMinutes() + estimatedMinutes);
            estimatedCompletionTime = fallbackDate.toISOString();
        }
    }
    
    // Priority: 1) scheduledPickupTime, 2) estimatedCompletionTime, 3) 30-min default
    // When no scheduled time is provided, use intelligent estimation
    const pickupTime = scheduledPickupTime || 
                      estimatedCompletionTime || 
                      db.raw("NOW() + INTERVAL '30 minutes'");
    
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
    
    // Attach estimation breakdown to result for API response
    result.estimationBreakdown = estimationBreakdown;
    
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
    let query = db('foodtruck.orders as o')
        .select(
            'o.*',
            'u.name as customer_name',
            'u.email as customer_email'
        )
        .join('foodtruck.users as u', 'o.userid', 'u.userid')
        .where('o.truckid', truckId);
    
    if (statuses && statuses.length > 0) {
        query = query.whereIn('o.orderstatus', statuses);
    }
    
    return await query.orderBy('o.createdat', 'desc');
};

/**
 * Gets new orders for vendor (pending, preparing, ready statuses)
 * @param {number} ownerId - The vendor/owner ID
 * @returns {Promise<Array>} - Array of orders with full details
 */
const getNewOrdersForVendor = async (ownerId) => {
    // Get all trucks owned by this vendor
    const trucks = await db('foodtruck.trucks')
        .select('truckid')
        .where('ownerid', ownerId);
    
    if (trucks.length === 0) {
        return [];
    }
    
    const truckIds = trucks.map(truck => truck.truckid);
    
    // Get orders with pending, preparing, or ready status
    const orders = await db('foodtruck.orders as o')
        .select(
            'o.*',
            'u.name as customer_name',
            'u.email as customer_email',
            't.truckname as truck_name'
        )
        .join('foodtruck.users as u', 'o.userid', 'u.userid')
        .join('foodtruck.trucks as t', 'o.truckid', 't.truckid')
        .whereIn('o.truckid', truckIds)
        .whereIn('o.orderstatus', ['pending', 'preparing', 'ready'])
        .orderBy('o.createdat', 'desc');
    
    // Get items for each order through junction table
    for (const order of orders) {
        const items = await db('foodtruck.orderitems as oi')
            .select('oi.*', 'oco.linenumber')
            .join('foodtruck.order_contains_orderitems as oco', 'oi.orderitemid', 'oco.orderitemid')
            .where('oco.orderid', order.orderid)
            .orderBy('oco.linenumber');
        
        order.items = items;
    }
    
    return orders;
};

/**
 * Updates order status and records completion time for analytics
 * @param {number} orderId - The order ID
 * @param {string} status - New status (pending, preparing, ready, completed, cancelled)
 * @returns {Promise<Object>} - Updated order
 */
const updateOrderStatus = async (orderId, status) => {
    const updateData = {
        orderstatus: status
    };
    
    // Record actual completion time when order is marked as ready or completed
    // This enables ML-style feedback loop for improving future estimates
    if (status === 'ready' || status === 'completed') {
        updateData.actualcompletiontime = db.raw('NOW()');
    }
    
    const [updatedOrder] = await db('foodtruck.orders')
        .where('orderid', orderId)
        .update(updateData)
        .returning('*');
    
    return updatedOrder;
};

/**
 * Get preparation time estimation for cart items before order placement
 * Useful for showing estimated time during checkout
 * @param {Array} items - Array of cart items
 * @param {number} truckId - Food truck ID
 * @returns {Promise<Object>} - Estimation with breakdown
 */
const getEstimationForCart = async (items, truckId) => {
    const enrichedItems = await preparationEstimator.enrichItemsWithPreparationData(items);
    return await preparationEstimator.estimatePreparationTime(enrichedItems, truckId);
};

/**
 * Get estimation accuracy metrics for a truck
 * @param {number} truckId - Food truck ID
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} - Accuracy metrics
 */
const getEstimationMetrics = async (truckId, days = 30) => {
    return await preparationEstimator.getEstimationAccuracyMetrics(truckId, days);
};

module.exports = {
    createOrder,
    createOrderItems,
    getOrderById,
    getOrdersByUserId,
    getOrdersByTruckId,
    getNewOrdersForVendor,
    updateOrderStatus,
    getEstimationForCart,
    getEstimationMetrics
};
