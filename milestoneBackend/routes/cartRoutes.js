const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/authMiddleware');
const db = require('../config/db');

/**
 * Cart Routes
 * Base path: /api/cart
 * All cart operations require authentication
 */

// Protect all cart routes
router.use(verifyToken);

/**
 * Get user's cart
 * GET /api/cart
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Get cart items with menu item details
        const cartItems = await db('foodtruck.carts as c')
            .select(
                'c.cartid',
                'c.itemid',
                'c.quantity',
                'c.price',
                'm.name',
                'm.description',
                'm.category',
                'm.truckid',
                't.truckname'
            )
            .join('foodtruck.menuitems as m', 'c.itemid', 'm.itemid')
            .join('foodtruck.trucks as t', 'm.truckid', 't.truckid')
            .where('c.userid', userId);
        
        // Calculate total
        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);
        
        res.json({
            success: true,
            count: cartItems.length,
            totalPrice: parseFloat(totalPrice.toFixed(2)),
            items: cartItems.map(item => ({
                cartId: item.cartid,
                itemId: item.itemid,
                name: item.name,
                description: item.description,
                category: item.category,
                quantity: item.quantity,
                price: parseFloat(item.price),
                subtotal: parseFloat((item.price * item.quantity).toFixed(2)),
                truckId: item.truckid,
                truckName: item.truckname
            }))
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        next(error);
    }
});

/**
 * Add item to cart
 * POST /api/cart
 * Body: { itemId: number, quantity: number }
 */
router.post('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId, quantity = 1 } = req.body;
        
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: 'itemId is required'
            });
        }
        
        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }
        
        // Get menu item details
        const menuItem = await db('foodtruck.menuitems')
            .select('itemid', 'name', 'price', 'status', 'truckid')
            .where('itemid', itemId)
            .first();
        
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        
        if (menuItem.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'This item is currently unavailable'
            });
        }
        
        // Check if item already in cart
        const existingItem = await db('foodtruck.carts')
            .where({ userid: userId, itemid: itemId })
            .first();
        
        let result;
        if (existingItem) {
            // Update quantity
            [result] = await db('foodtruck.carts')
                .where({ cartid: existingItem.cartid })
                .update({
                    quantity: existingItem.quantity + quantity
                })
                .returning('*');
        } else {
            // Check if cart has items from different truck
            const cartItems = await db('foodtruck.carts as c')
                .join('foodtruck.menuitems as m', 'c.itemid', 'm.itemid')
                .where('c.userid', userId)
                .first();
            
            if (cartItems && cartItems.truckid !== menuItem.truckid) {
                return res.status(400).json({
                    success: false,
                    message: 'Cart already has items from a different truck. Please clear your cart first.',
                    currentTruckId: cartItems.truckid
                });
            }
            
            // Insert new cart item
            [result] = await db('foodtruck.carts')
                .insert({
                    userid: userId,
                    itemid: itemId,
                    quantity: quantity,
                    price: menuItem.price
                })
                .returning('*');
        }
        
        res.status(201).json({
            success: true,
            message: 'Item added to cart',
            item: {
                cartId: result.cartid,
                itemId: result.itemid,
                name: menuItem.name,
                quantity: result.quantity,
                price: parseFloat(result.price),
                subtotal: parseFloat((result.price * result.quantity).toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        next(error);
    }
});

/**
 * Update cart item quantity
 * PATCH /api/cart/:cartId
 * Body: { quantity: number }
 */
router.patch('/:cartId', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { cartId } = req.params;
        const { quantity } = req.body;
        
        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }
        
        // Verify cart item belongs to user
        const cartItem = await db('foodtruck.carts')
            .where({ cartid: cartId, userid: userId })
            .first();
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        if (quantity === 0) {
            // Remove item if quantity is 0
            await db('foodtruck.carts')
                .where({ cartid: cartId })
                .delete();
            
            return res.json({
                success: true,
                message: 'Item removed from cart'
            });
        }
        
        // Update quantity
        const [result] = await db('foodtruck.carts')
            .where({ cartid: cartId })
            .update({ quantity })
            .returning('*');
        
        res.json({
            success: true,
            message: 'Cart updated',
            item: {
                cartId: result.cartid,
                itemId: result.itemid,
                quantity: result.quantity,
                price: parseFloat(result.price),
                subtotal: parseFloat((result.price * result.quantity).toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        next(error);
    }
});

/**
 * Remove item from cart
 * DELETE /api/cart/:cartId
 */
router.delete('/:cartId', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { cartId } = req.params;
        
        // Verify cart item belongs to user
        const cartItem = await db('foodtruck.carts')
            .where({ cartid: cartId, userid: userId })
            .first();
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }
        
        await db('foodtruck.carts')
            .where({ cartid: cartId })
            .delete();
        
        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        next(error);
    }
});

/**
 * Clear entire cart
 * DELETE /api/cart
 */
router.delete('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        await db('foodtruck.carts')
            .where({ userid: userId })
            .delete();
        
        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        next(error);
    }
});

/**
 * Checkout - Convert cart to order
 * POST /api/cart/checkout
 * Body: { scheduledPickupTime?: string }
 */
router.post('/checkout', async (req, res, next) => {
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
            
            // Create order items
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
                
                // Link to order
                await trx('foodtruck.order_contains_orderitems')
                    .insert({
                        orderid: order.orderid,
                        orderitemid: orderItem.orderitemid,
                        linenumber: i + 1,
                        createdat: trx.raw('NOW()')
                    });
                
                orderItems.push(orderItem);
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
            order: {
                orderId: result.order.orderid,
                userId: result.order.userid,
                truckId: result.order.truckid,
                truckName: truck.truckname,
                status: result.order.orderstatus,
                totalPrice: parseFloat(result.order.totalprice),
                scheduledPickupTime: result.order.scheduledpickuptime,
                createdAt: result.order.createdat,
                items: result.orderItems.map(item => ({
                    orderItemId: item.orderitemid,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price)
                }))
            }
        });
    } catch (error) {
        console.error('Error during checkout:', error);
        next(error);
    }
});

module.exports = router;
