const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyToken } = require('../../../middleware/authMiddleware');

/**
 * Cart Routes - /api/v1/cart
 * All routes require authentication (Customer role)
 */

/**
 * Add item to cart
 * POST /api/v1/cart/new
 * Role: Customer
 */
router.post('/new', verifyToken, async (req, res, next) => {
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

        // Check if cart has items from different truck
        const existingCartItem = await db('foodtruck.carts as c')
            .join('foodtruck.menuitems as m', 'c.itemid', 'm.itemid')
            .where('c.userid', userId)
            .first();

        if (existingCartItem && existingCartItem.truckid !== menuItem.truckid) {
            return res.status(400).json({
                success: false,
                message: 'Cart already has items from a different truck. Please clear your cart first.',
                currentTruckId: existingCartItem.truckid
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
            data: {
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
 * View cart
 * GET /api/v1/cart/view
 * Role: Customer
 */
router.get('/view', verifyToken, async (req, res, next) => {
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
            data: cartItems.map(item => ({
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
 * Update cart quantity
 * PUT /api/v1/cart/edit/:cartId
 * Role: Customer
 */
router.put('/edit/:cartId', verifyToken, async (req, res, next) => {
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
            data: {
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
 * DELETE /api/v1/cart/delete/:cartId
 * Role: Customer
 */
router.delete('/delete/:cartId', verifyToken, async (req, res, next) => {
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
 * DELETE /api/v1/cart/clear
 * Role: Customer
 */
router.delete('/clear', verifyToken, async (req, res, next) => {
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

module.exports = router;
