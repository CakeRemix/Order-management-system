const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

/**
 * Order Routes
 * Base path: /api/orders
 */

// Create a new order
// POST /api/orders
router.post('/', orderController.createOrder);

// Get order by ID
// GET /api/orders/:orderId
router.get('/:orderId', orderController.getOrder);

// Get all orders for a specific user
// GET /api/orders/user/:userId
router.get('/user/:userId', orderController.getUserOrders);

module.exports = router;
