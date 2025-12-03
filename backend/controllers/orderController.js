const orderModel = require('../models/orderModel');
const db = require('../config/db');

/**
 * Order Controller
 * Handles business logic for order operations
 */

/**
 * Create a new order
 * POST /api/orders
 * 
 * Request body:
 * {
 *   "userId": 1,
 *   "truckId": 1,
 *   "items": [
 *     { "itemId": 1, "name": "Burger", "quantity": 2, "price": 10.99 },
 *     { "itemId": 2, "name": "Fries", "quantity": 1, "price": 3.99 }
 *   ],
 *   "scheduledPickupTime": "2025-12-02T14:30:00Z" (optional)
 * }
 */
const createOrder = async (req, res) => {
    try {
        const { userId, truckId, items, scheduledPickupTime } = req.body;
        
        // Validation: Check required fields
        if (!userId || !truckId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields. Need: userId, truckId, and items array'
            });
        }
        
        // Validation: Check each item has required fields
        for (const item of items) {
            if (!item.itemId || !item.name || !item.quantity || item.price === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have: itemId, name, quantity, and price'
                });
            }
            
            if (item.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity must be greater than 0'
                });
            }
        }
        
        // Calculate total price
        const totalPrice = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        
        // Verify user exists
        const userCheck = await db('foodtruck.users')
            .where('userid', userId)
            .first();
        
        if (!userCheck) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify truck exists and is available
        const truckCheck = await db('foodtruck.trucks')
            .where('truckid', truckId)
            .first();
        
        if (!truckCheck) {
            return res.status(404).json({
                success: false,
                message: 'Food truck not found'
            });
        }
        
        if (truckCheck.truckstatus === 'unavailable' || truckCheck.orderstatus === 'unavailable') {
            return res.status(400).json({
                success: false,
                message: 'This food truck is currently not accepting orders'
            });
        }
        
        // Verify all menu items exist and are available
        for (const item of items) {
            const itemCheck = await db('foodtruck.menuitems')
                .where({
                    itemid: item.itemId,
                    truckid: truckId
                })
                .first();
            
            if (!itemCheck) {
                return res.status(404).json({
                    success: false,
                    message: `Menu item with ID ${item.itemId} not found for this truck`
                });
            }
            
            if (itemCheck.status !== 'available') {
                return res.status(400).json({
                    success: false,
                    message: `Item "${itemCheck.name}" is currently unavailable`
                });
            }
        }
        
        // Create the order
        const orderData = {
            userId,
            truckId,
            totalPrice: parseFloat(totalPrice.toFixed(2)),
            orderStatus: 'pending',
            scheduledPickupTime
        };
        
        const newOrder = await orderModel.createOrder(orderData);
        
        // Create order items (stored separately in database)
        const orderItems = await orderModel.createOrderItems(newOrder.orderid, items);
        
        // Get complete order
        const completeOrder = await orderModel.getOrderById(newOrder.orderid);
        
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                orderId: completeOrder.orderid,
                userId: completeOrder.userid,
                truckId: completeOrder.truckid,
                truckName: completeOrder.truck_name,
                orderStatus: completeOrder.orderstatus,
                totalPrice: parseFloat(completeOrder.totalprice),
                scheduledPickupTime: completeOrder.scheduledpickuptime,
                createdAt: completeOrder.createdat,
                items: orderItems.map(item => ({
                    orderItemId: item.orderitemid,
                    itemId: item.itemid,
                    quantity: item.quantity,
                    price: parseFloat(item.price)
                }))
            }
        });
        
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

/**
 * Get order by ID
 * GET /api/orders/:orderId
 */
const getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await orderModel.getOrderById(parseInt(orderId));
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: {
                orderId: order.orderid,
                userId: order.userid,
                customerName: order.customer_name,
                email: order.customer_email,
                truckId: order.truckid,
                truckName: order.truck_name,
                orderStatus: order.orderstatus,
                totalPrice: parseFloat(order.totalprice),
                scheduledPickupTime: order.scheduledpickuptime,
                estimatedEarliestPickup: order.estimatedearliestpickup,
                createdAt: order.createdat,
                items: order.items.map(item => ({
                    orderItemId: item.orderitemid,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    lineNumber: item.linenumber
                }))
            }
        });
        
    } catch (error) {
        console.error('Error fetching order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

/**
 * Get all orders for a user
 * GET /api/orders/user/:userId
 */
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const orders = await orderModel.getOrdersByUserId(parseInt(userId));
        
        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders.map(order => ({
                orderId: order.orderid,
                truckId: order.truckid,
                truckName: order.truck_name,
                orderStatus: order.orderstatus,
                totalPrice: parseFloat(order.totalprice),
                scheduledPickupTime: order.scheduledpickuptime,
                createdAt: order.createdat
            }))
        });
        
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

/**
 * Get new orders for vendor (pending, preparing, ready statuses only)
 * GET /api/orders/vendor/:ownerId/new
 */
const getNewOrdersForVendor = async (req, res) => {
    try {
        const { ownerId } = req.params;
        
        // Authorization: Ensure the authenticated user is the vendor/owner
        if (req.user.id !== parseInt(ownerId)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only view orders for your own trucks'
            });
        }
        
        // Verify user is a truck owner
        if (req.user.role !== 'truckOwner' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Only truck owners can access this endpoint'
            });
        }
        
        const orders = await orderModel.getNewOrdersForVendor(parseInt(ownerId));
        
        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders.map(order => ({
                orderId: order.orderid,
                customerId: order.userid,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                truckId: order.truckid,
                truckName: order.truck_name,
                orderStatus: order.orderstatus,
                totalPrice: parseFloat(order.totalprice),
                scheduledPickupTime: order.scheduledpickuptime,
                estimatedEarliestPickup: order.estimatedearliestpickup,
                createdAt: order.createdat,
                items: order.items.map(item => ({
                    orderItemId: item.orderitemid,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    lineNumber: item.linenumber
                }))
            }))
        });
        
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch vendor orders',
            error: error.message
        });
    }
};

/**
 * Update order status
 * PATCH /api/orders/:orderId/status
 * 
 * Request body: { "status": "preparing" | "ready" | "completed" | "cancelled" }
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        // Verify user is a truck owner or admin
        if (req.user.role !== 'truckOwner' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Only truck owners can update order status'
            });
        }
        
        // Verify the order belongs to one of the vendor's trucks
        const order = await db('foodtruck.orders')
            .where('orderid', parseInt(orderId))
            .first();
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const truck = await db('foodtruck.trucks')
            .where('truckid', order.truckid)
            .first();
        
        if (truck.ownerid !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only update orders for your own trucks'
            });
        }
        
        const updatedOrder = await orderModel.updateOrderStatus(parseInt(orderId), status);
        
        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: {
                orderId: updatedOrder.orderid,
                orderStatus: updatedOrder.orderstatus
            }
        });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getOrder,
    getUserOrders,
    getNewOrdersForVendor,
    updateOrderStatus
};
