const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyToken, verifyRole } = require('../../../middleware/authMiddleware');

/**
 * Order Routes - /api/v1/order
 */

/**
 * Place order (from cart)
 * POST /api/v1/order/new
 * Role: Customer
 */
router.post('/new', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { scheduledPickupTime } = req.body;

        // Get cart items
        const cartItems = await db('foodtruck.carts as c')
            .select(
                'c.cartid',
                'c.itemid',
                'c.quantity',
                'c.price',
                'm.name',
                'm.truckid'
            )
            .join('foodtruck.menuitems as m', 'c.itemid', 'm.itemid')
            .where('c.userid', userId);

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // All items should be from same truck
        const truckId = cartItems[0].truckid;

        // Verify truck is available
        const truck = await db('foodtruck.trucks')
            .where('truckid', truckId)
            .first();

        if (!truck || truck.truckstatus === 'unavailable' || truck.orderstatus === 'unavailable') {
            return res.status(400).json({
                success: false,
                message: 'This food truck is currently not accepting orders'
            });
        }

        // Calculate total
        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        // Create order in transaction
        const result = await db.transaction(async (trx) => {
            // Create order
            const [order] = await trx('foodtruck.orders')
                .insert({
                    userid: userId,
                    truckid: truckId,
                    orderstatus: 'pending',
                    totalprice: parseFloat(totalPrice.toFixed(2)),
                    scheduledpickuptime: scheduledPickupTime || trx.raw("NOW() + INTERVAL '30 minutes'"),
                    createdat: trx.raw('NOW()')
                })
                .returning('*');

            // Create order items using actual schema:
            // 1. Insert into orderitems (name, quantity, price)
            // 2. Link via order_contains_orderitems (orderid, orderitemid)
            const orderItems = [];
            for (let i = 0; i < cartItems.length; i++) {
                const item = cartItems[i];

                // Create order item
                const [orderItem] = await trx('foodtruck.orderitems')
                    .insert({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        createdat: trx.raw('NOW()')
                    })
                    .returning('*');

                // Link order item to order via junction table
                await trx('foodtruck.order_contains_orderitems')
                    .insert({
                        orderid: order.orderid,
                        orderitemid: orderItem.orderitemid,
                        linenumber: i + 1,
                        createdat: trx.raw('NOW()')
                    });

                orderItems.push({
                    ...orderItem,
                    itemId: item.itemid
                });
            }

            // Clear cart
            await trx('foodtruck.carts')
                .where({ userid: userId })
                .delete();

            return { order, orderItems };
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                orderId: result.order.orderid,
                userId: result.order.userid,
                truckId: result.order.truckid,
                truckName: truck.truckname,
                orderStatus: result.order.orderstatus,
                totalPrice: parseFloat(result.order.totalprice),
                scheduledPickupTime: result.order.scheduledpickuptime,
                createdAt: result.order.createdat,
                items: result.orderItems.map(item => ({
                    orderItemId: item.orderitemid,
                    itemId: item.itemid,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price)
                }))
            }
        });
    } catch (error) {
        console.error('Error placing order:', error);
        next(error);
    }
});

/**
 * View my orders
 * GET /api/v1/order/myOrders
 * Role: Customer
 */
router.get('/myOrders', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const orders = await db('foodtruck.orders as o')
            .select(
                'o.*',
                't.truckname'
            )
            .join('foodtruck.trucks as t', 'o.truckid', 't.truckid')
            .where('o.userid', userId)
            .orderBy('o.createdat', 'desc');

        res.json({
            success: true,
            count: orders.length,
            data: orders.map(order => ({
                orderId: order.orderid,
                truckId: order.truckid,
                truckName: order.truckname,
                orderStatus: order.orderstatus,
                totalPrice: parseFloat(order.totalprice),
                scheduledPickupTime: order.scheduledpickuptime,
                createdAt: order.createdat
            }))
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        next(error);
    }
});

/**
 * View order details
 * GET /api/v1/order/details/:orderId
 * Role: Customer
 */
router.get('/details/:orderId', verifyToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const order = await db('foodtruck.orders as o')
            .select(
                'o.*',
                't.truckname',
                't.trucklogo'
            )
            .join('foodtruck.trucks as t', 'o.truckid', 't.truckid')
            .where({ 'o.orderid': orderId, 'o.userid': userId })
            .first();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get order items via junction table
        const orderItems = await db('foodtruck.order_contains_orderitems as oco')
            .select('oi.*', 'oco.linenumber')
            .join('foodtruck.orderitems as oi', 'oco.orderitemid', 'oi.orderitemid')
            .where('oco.orderid', orderId)
            .orderBy('oco.linenumber');

        res.json({
            success: true,
            data: {
                orderId: order.orderid,
                userId: order.userid,
                truckId: order.truckid,
                truckName: order.truckname,
                truckLogo: order.trucklogo,
                orderStatus: order.orderstatus,
                totalPrice: parseFloat(order.totalprice),
                scheduledPickupTime: order.scheduledpickuptime,
                estimatedEarliestPickup: order.estimatedearliestpickup,
                createdAt: order.createdat,
                items: orderItems.map(item => ({
                    orderItemId: item.orderitemid,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    subtotal: parseFloat((item.price * item.quantity).toFixed(2))
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        next(error);
    }
});

/**
 * View truck owner's orders (single order detail)
 * GET /api/v1/order/truckOwner/:orderId
 * Role: Truck Owner
 */
router.get('/truckOwner/:orderId', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        // Get truck owned by this user
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where('ownerid', userId)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this owner'
            });
        }

        // Get order (must belong to this truck)
        const order = await db('foodtruck.orders as o')
            .select(
                'o.*',
                'u.name as customer_name',
                'u.email as customer_email'
            )
            .join('foodtruck.users as u', 'o.userid', 'u.userid')
            .where({ 'o.orderid': orderId, 'o.truckid': truck.truckid })
            .first();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or does not belong to your truck'
            });
        }

        // Get order items via junction table
        const orderItems = await db('foodtruck.order_contains_orderitems as oco')
            .select('oi.*', 'oco.linenumber')
            .join('foodtruck.orderitems as oi', 'oco.orderitemid', 'oi.orderitemid')
            .where('oco.orderid', orderId)
            .orderBy('oco.linenumber');

        res.json({
            success: true,
            data: {
                orderId: order.orderid,
                customerId: order.userid,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                orderStatus: order.orderstatus,
                totalPrice: parseFloat(order.totalprice),
                scheduledPickupTime: order.scheduledpickuptime,
                estimatedEarliestPickup: order.estimatedearliestpickup,
                createdAt: order.createdat,
                items: orderItems.map(item => ({
                    orderItemId: item.orderitemid,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    subtotal: parseFloat((item.price * item.quantity).toFixed(2))
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        next(error);
    }
});

/**
 * View all truck's orders
 * GET /api/v1/order/truckOrders
 * Role: Truck Owner
 */
router.get('/truckOrders', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { status } = req.query; // Optional filter by status

        // Get truck owned by this user
        const truck = await db('foodtruck.trucks')
            .select('truckid', 'truckname')
            .where('ownerid', userId)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this owner'
            });
        }

        // Build query
        let query = db('foodtruck.orders as o')
            .select(
                'o.*',
                'u.name as customer_name',
                'u.email as customer_email'
            )
            .join('foodtruck.users as u', 'o.userid', 'u.userid')
            .where('o.truckid', truck.truckid)
            .orderBy('o.createdat', 'desc');

        // Apply status filter if provided
        if (status) {
            query = query.where('o.orderstatus', status);
        }

        const orders = await query;

        res.json({
            success: true,
            truck: {
                truckId: truck.truckid,
                truckName: truck.truckname
            },
            count: orders.length,
            data: orders.map(order => ({
                orderId: order.orderid,
                customerId: order.userid,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                orderStatus: order.orderstatus,
                totalPrice: parseFloat(order.totalprice),
                scheduledPickupTime: order.scheduledpickuptime,
                createdAt: order.createdat
            }))
        });
    } catch (error) {
        console.error('Error fetching truck orders:', error);
        next(error);
    }
});

/**
 * Update order status
 * PUT /api/v1/order/updateStatus/:orderId
 * Role: Truck Owner
 */
router.put('/updateStatus/:orderId', verifyToken, verifyRole('truckOwner'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
        if (!orderStatus || !validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Get truck owned by this user
        const truck = await db('foodtruck.trucks')
            .select('truckid')
            .where('ownerid', userId)
            .first();

        if (!truck) {
            return res.status(404).json({
                success: false,
                message: 'No truck found for this owner'
            });
        }

        // Verify order belongs to this truck
        const order = await db('foodtruck.orders')
            .where({ orderid: orderId, truckid: truck.truckid })
            .first();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or does not belong to your truck'
            });
        }

        // Update order status
        const [updatedOrder] = await db('foodtruck.orders')
            .where('orderid', orderId)
            .update({ orderstatus: orderStatus })
            .returning('*');

        res.json({
            success: true,
            message: `Order status updated to ${orderStatus}`,
            data: {
                orderId: updatedOrder.orderid,
                orderStatus: updatedOrder.orderstatus,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        next(error);
    }
});

module.exports = router;
