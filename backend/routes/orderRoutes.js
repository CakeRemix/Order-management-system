/**
 * Order Routes
 * Endpoints for order management and polling
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

// Order polling endpoints
router.get('/:id/status', OrderController.getOrderStatus);
router.post('/batch/status', OrderController.batchGetOrderStatus);

// Order management endpoints
router.get('/:id', OrderController.getOrder);
router.post('/', OrderController.createOrder);
router.patch('/:id/status', OrderController.updateOrderStatus);
router.get('/customer/:customerId', OrderController.getCustomerOrders);

// Polling metrics and maintenance
router.get('/metrics/polling', OrderController.getPollingMetrics);
router.post('/cleanup/:id', OrderController.cleanupPolling);

module.exports = router;
