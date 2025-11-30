/**
 * Order Controller
 * Handles order-related API endpoints including polling
 */

const OrderModel = require('../models/orderModel');
const { getPollingService } = require('../services/pollingService');

class OrderController {
  /**
   * GET /api/orders/:id/status
   * Get order status with polling support
   * Handles exponential backoff and caching automatically
   */
  static async getOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const pollingService = getPollingService();

      // Poll the order status with all optimizations
      const result = await pollingService.pollOrderStatus(id, async (orderId) => {
        return await OrderModel.getStatusWithProgress(orderId);
      });

      if (result.error) {
        return res.status(409).json({ error: result.error });
      }

      res.json({
        success: true,
        data: result.status,
        polling: {
          nextPollInterval: result.interval,
          statusChanged: result.changed,
          fromCache: result.cached
        }
      });
    } catch (error) {
      console.error('Error getting order status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order status'
      });
    }
  }

  /**
   * GET /api/orders/batch/status
   * Batch poll multiple orders
   * More efficient for polling multiple orders
   */
  static async batchGetOrderStatus(req, res) {
    try {
      const { order_ids } = req.body;

      if (!Array.isArray(order_ids) || order_ids.length === 0) {
        return res.status(400).json({ error: 'order_ids must be a non-empty array' });
      }

      if (order_ids.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 orders per request' });
      }

      const pollingService = getPollingService();

      const results = await pollingService.batchPollOrderStatus(
        order_ids,
        async (ids) => await OrderModel.getStatusBatch(ids)
      );

      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      console.error('Error batch polling orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order statuses'
      });
    }
  }

  /**
   * GET /api/orders/customer/:customerId
   * Get all orders for a customer with their current status
   */
  static async getCustomerOrders(req, res) {
    try {
      const { customerId } = req.params;
      const { limit = 20, offset = 0, status } = req.query;

      const orders = await OrderModel.getByCustomerId(
        customerId,
        { limit: parseInt(limit), offset: parseInt(offset), status }
      );

      res.json({
        success: true,
        data: orders,
        count: orders.length
      });
    } catch (error) {
      console.error('Error getting customer orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer orders'
      });
    }
  }

  /**
   * GET /api/orders/:id
   * Get full order details
   */
  static async getOrder(req, res) {
    try {
      const { id } = req.params;

      const order = await OrderModel.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order'
      });
    }
  }

  /**
   * POST /api/orders
   * Create a new order
   */
  static async createOrder(req, res) {
    try {
      const {
        customer_id,
        food_truck_id,
        order_number,
        items,
        subtotal,
        tax,
        total,
        pickup_time,
        estimated_prep_time,
        notes,
        payment_method
      } = req.body;

      // Validate required fields
      if (!customer_id || !food_truck_id || !order_number) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const order = await OrderModel.create({
        customer_id,
        food_truck_id,
        order_number,
        subtotal,
        tax,
        total,
        pickup_time,
        estimated_prep_time,
        notes,
        payment_method
      });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order'
      });
    }
  }

  /**
   * PATCH /api/orders/:id/status
   * Update order status
   */
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const updatedOrder = await OrderModel.updateStatus(id, status);

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Clean up polling data if order reached terminal state
      if (['completed', 'cancelled'].includes(status)) {
        const pollingService = getPollingService();
        pollingService.cleanupOrder(id);
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: `Order status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update order status'
      });
    }
  }

  /**
   * GET /api/polling/metrics
   * Get polling service metrics
   * Admin/monitoring endpoint
   */
  static async getPollingMetrics(req, res) {
    try {
      const pollingService = getPollingService();
      const metrics = pollingService.getMetrics();
      const health = pollingService.getHealth();

      res.json({
        success: true,
        metrics,
        health
      });
    } catch (error) {
      console.error('Error getting polling metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get polling metrics'
      });
    }
  }

  /**
   * POST /api/polling/cleanup/:id
   * Manually cleanup polling data for an order
   * Call when you know polling is no longer needed
   */
  static async cleanupPolling(req, res) {
    try {
      const { id } = req.params;
      const pollingService = getPollingService();

      pollingService.cleanupOrder(id);

      res.json({
        success: true,
        message: `Cleanup initiated for order ${id}`
      });
    } catch (error) {
      console.error('Error cleaning up polling:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup polling'
      });
    }
  }
}

module.exports = OrderController;
