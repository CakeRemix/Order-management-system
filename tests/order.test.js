/**
 * Order API Tests
 * Integration tests for order endpoints
 */

const request = require('supertest');
const app = require('../server');
const OrderModel = require('../backend/models/orderModel');
const { getPollingService } = require('../backend/services/pollingService');

// Mock OrderModel
jest.mock('../backend/models/orderModel');

describe('Order API Endpoints', () => {
  let pollingService;

  beforeEach(() => {
    pollingService = getPollingService();
    pollingService.clearAll();
  });

  describe('GET /api/orders/:id/status', () => {
    it('should return order status with polling metadata', async () => {
      OrderModel.getStatusWithProgress.mockResolvedValue({
        id: 1,
        status: 'preparing',
        progress_percent: 50,
        estimated_prep_time: 15,
        elapsed_minutes: 7.5,
        updated_at: new Date()
      });

      const res = await request(app)
        .get('/api/orders/1/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('progress_percent');
      expect(res.body.polling).toHaveProperty('nextPollInterval');
      expect(res.body.polling).toHaveProperty('statusChanged');
      expect(res.body.polling).toHaveProperty('fromCache');
    });

    it('should cache results', async () => {
      OrderModel.getStatusWithProgress.mockResolvedValue({
        id: 1,
        status: 'preparing',
        progress_percent: 50,
        updated_at: new Date()
      });

      const res1 = await request(app).get('/api/orders/1/status');
      const res2 = await request(app).get('/api/orders/1/status');

      expect(OrderModel.getStatusWithProgress).toHaveBeenCalledTimes(1);
      expect(res1.body.polling.cached).toBe(false);
      expect(res2.body.polling.cached).toBe(true);
    });

    it('should return 500 on error', async () => {
      OrderModel.getStatusWithProgress.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .get('/api/orders/999/status');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/orders/batch/status', () => {
    it('should batch poll multiple orders', async () => {
      OrderModel.getStatusBatch.mockResolvedValue([
        { id: 1, status: 'preparing' },
        { id: 2, status: 'ready' },
        { id: 3, status: 'preparing' }
      ]);

      const res = await request(app)
        .post('/api/orders/batch/status')
        .send({ order_ids: [1, 2, 3] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.count).toBe(3);
    });

    it('should validate order_ids parameter', async () => {
      const res = await request(app)
        .post('/api/orders/batch/status')
        .send({ order_ids: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should enforce max 100 orders', async () => {
      const largeArray = Array.from({ length: 101 }, (_, i) => i + 1);
      
      const res = await request(app)
        .post('/api/orders/batch/status')
        .send({ order_ids: largeArray });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Maximum');
    });
  });

  describe('GET /api/orders/customer/:customerId', () => {
    it('should return customer orders', async () => {
      OrderModel.getByCustomerId.mockResolvedValue([
        { id: 1, order_number: 'ORD-001', status: 'preparing', total: 15.99 },
        { id: 2, order_number: 'ORD-002', status: 'ready', total: 12.50 }
      ]);

      const res = await request(app)
        .get('/api/orders/customer/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should support pagination', async () => {
      OrderModel.getByCustomerId.mockResolvedValue([]);

      await request(app)
        .get('/api/orders/customer/1?limit=10&offset=20');

      expect(OrderModel.getByCustomerId).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          limit: 10,
          offset: 20
        })
      );
    });

    it('should filter by status', async () => {
      OrderModel.getByCustomerId.mockResolvedValue([]);

      await request(app)
        .get('/api/orders/customer/1?status=preparing');

      expect(OrderModel.getByCustomerId).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: 'preparing'
        })
      );
    });
  });

  describe('POST /api/orders', () => {
    it('should create an order', async () => {
      OrderModel.create.mockResolvedValue({
        id: 1,
        customer_id: 1,
        order_number: 'ORD-001',
        status: 'received'
      });

      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_id: 1,
          food_truck_id: 1,
          order_number: 'ORD-001',
          subtotal: 15.00,
          tax: 1.50,
          total: 16.50,
          pickup_time: new Date(),
          estimated_prep_time: 15
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_id: 1
          // Missing other required fields
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status', async () => {
      OrderModel.updateStatus.mockResolvedValue({
        id: 1,
        status: 'ready'
      });

      const res = await request(app)
        .patch('/api/orders/1/status')
        .send({ status: 'ready' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ready');
    });

    it('should cleanup polling data for terminal states', async () => {
      OrderModel.updateStatus.mockResolvedValue({
        id: 1,
        status: 'completed'
      });

      const cleanupSpy = jest.spyOn(pollingService, 'cleanupOrder');

      await request(app)
        .patch('/api/orders/1/status')
        .send({ status: 'completed' });

      expect(cleanupSpy).toHaveBeenCalledWith('1');
    });

    it('should validate status parameter', async () => {
      const res = await request(app)
        .patch('/api/orders/1/status')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/polling/metrics', () => {
    it('should return polling metrics', async () => {
      const res = await request(app)
        .get('/api/polling/metrics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metrics).toHaveProperty('totalPolls');
      expect(res.body.metrics).toHaveProperty('cacheHits');
      expect(res.body.health).toHaveProperty('status');
    });
  });

  describe('POST /api/polling/cleanup/:id', () => {
    it('should cleanup polling data', async () => {
      const cleanupSpy = jest.spyOn(pollingService, 'cleanupOrder');

      const res = await request(app)
        .post('/api/polling/cleanup/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cleanupSpy).toHaveBeenCalledWith('1');
    });
  });
});
