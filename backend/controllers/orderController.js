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
        const userCheck = await db('public.users')
            .where('id', userId)
            .first();
        
        if (!userCheck) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify truck exists and is available
        const truckCheck = await db('public.food_trucks')
            .where('id', truckId)
            .first();
        
        if (!truckCheck) {
            return res.status(404).json({
                success: false,
                message: 'Food truck not found'
            });
        }
        
        if (truckCheck.status === 'closed' || !truckCheck.is_active) {
            return res.status(400).json({
                success: false,
                message: 'This food truck is currently not accepting orders'
            });
        }
        
        // Verify all menu items exist and are available
        for (const item of items) {
            const itemCheck = await db('public.menu_items')
                .where({
                    id: item.itemId,
                    food_truck_id: truckId
                })
                .first();
            
            if (!itemCheck) {
                return res.status(404).json({
                    success: false,
                    message: `Menu item with ID ${item.itemId} not found for this truck`
                });
            }
            
            if (!itemCheck.is_available || !itemCheck.is_active) {
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
            orderStatus: 'received',
            scheduledPickupTime
        };
        
        const newOrder = await orderModel.createOrder(orderData);
        
        // Create order items (stored separately in database)
        const orderItems = await orderModel.createOrderItems(newOrder.id, items);
        
        // Get complete order
        const completeOrder = await orderModel.getOrderById(newOrder.id);
        
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                orderId: completeOrder.id,
                orderNumber: completeOrder.order_number,
                userId: completeOrder.customer_id,
                truckId: completeOrder.food_truck_id,
                truckName: completeOrder.truck_name,
                orderStatus: completeOrder.status,
                totalPrice: parseFloat(completeOrder.total),
                scheduledPickupTime: completeOrder.pickup_time,
                estimatedPrepTime: completeOrder.estimated_prep_time,
                createdAt: completeOrder.created_at,
                items: orderItems.map(item => ({
                    orderItemId: item.id,
                    name: item.item_name,
                    quantity: item.quantity,
                    unitPrice: parseFloat(item.unit_price),
                    subtotal: parseFloat(item.subtotal)
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
                orderId: order.id,
                orderNumber: order.order_number,
                userId: order.customer_id,
                customerName: order.customer_name,
                email: order.customer_email,
                truckId: order.food_truck_id,
                truckName: order.truck_name,
                orderStatus: order.status,
                totalPrice: parseFloat(order.total),
                scheduledPickupTime: order.pickup_time,
                estimatedPrepTime: order.estimated_prep_time,
                createdAt: order.created_at,
                items: order.items.map(item => ({
                    orderItemId: item.id,
                    menuItemId: item.menu_item_id,
                    name: item.item_name,
                    quantity: item.quantity,
                    unitPrice: parseFloat(item.unit_price),
                    subtotal: parseFloat(item.subtotal)
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
                orderId: order.id,
                orderNumber: order.order_number,
                truckId: order.food_truck_id,
                truckName: order.truck_name,
                orderStatus: order.status,
                totalPrice: parseFloat(order.total),
                scheduledPickupTime: order.pickup_time,
                createdAt: order.created_at
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

module.exports = {
    createOrder,
    getOrder,
    getUserOrders
};
