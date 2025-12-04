const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../../middleware/authMiddleware');

/**
 * Order Routes
 * Base path: /api/orders
 */

// Get preparation time estimate for cart items (before order placement)
// POST /api/orders/estimate
router.post('/estimate', orderController.getPreparationEstimate);

// Get estimation accuracy metrics for vendor dashboard
// GET /api/orders/metrics/:truckId
router.get('/metrics/:truckId', verifyToken, orderController.getEstimationMetrics);

// Create a new order
// POST /api/orders
router.post('/', orderController.createOrder);

// Get new orders for vendor (pending, preparing, ready)
// GET /api/orders/vendor/:ownerId/new
router.get('/vendor/:ownerId/new', verifyToken, orderController.getNewOrdersForVendor);

// Get all orders for a specific user
// GET /api/orders/user/:userId
router.get('/user/:userId', orderController.getUserOrders);

// Get order by ID
// GET /api/orders/:orderId
router.get('/:orderId', orderController.getOrder);

// Update order status
// PATCH /api/orders/:orderId/status
router.patch('/:orderId/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;
