/**
 * Polling Service Tests
 * Unit tests for PollingService
 */

const { PollingService } = require('../backend/services/pollingService');

describe('PollingService', () => {
  let service;
  let mockFetch;

  beforeEach(() => {
    service = new PollingService({
      minInterval: 1000,
      maxInterval: 10000,
      backoffMultiplier: 2,
      maxConsecutiveNoChange: 2
    });
    
    mockFetch = jest.fn();
  });

  afterEach(() => {
    service.clearAll();
  });

  describe('Caching', () => {
    it('should cache status results', async () => {
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      const result1 = await service.pollOrderStatus(1, mockFetch);
      const result2 = await service.pollOrderStatus(1, mockFetch);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(true);
    });

    it('should invalidate cache after TTL', async () => {
      service.cacheTTL = 100; // 100ms TTL
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      await service.pollOrderStatus(1, mockFetch);
      
      await new Promise(resolve => setTimeout(resolve, 150));

      const result = service.getCachedStatus(1);
      expect(result).toBeNull();
    });

    it('should track cache hit rate', async () => {
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      await service.pollOrderStatus(1, mockFetch);
      await service.pollOrderStatus(1, mockFetch);
      await service.pollOrderStatus(1, mockFetch);

      const metrics = service.getMetrics();
      expect(metrics.cacheHitRate).toContain('66');
    });
  });

  describe('Exponential Backoff', () => {
    it('should increase interval when status unchanged', async () => {
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      const initialInterval = service.getCurrentInterval(1);
      expect(initialInterval).toBe(service.minInterval);

      // Simulate no status change
      service.updateInterval(1, false);
      service.noChangeCount.set(1, service.maxConsecutiveNoChange);

      service.updateInterval(1, false);
      const newInterval = service.getCurrentInterval(1);

      expect(newInterval).toBeGreaterThan(initialInterval);
    });

    it('should reset interval on status change', async () => {
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      service.pollIntervals.set(1, 10000); // Set to max
      service.updateInterval(1, true); // Status changed

      expect(service.getCurrentInterval(1)).toBe(service.minInterval);
    });

    it('should not exceed maxInterval', async () => {
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      let interval = service.minInterval;
      for (let i = 0; i < 10; i++) {
        service.updateInterval(1, false);
        service.noChangeCount.set(1, service.maxConsecutiveNoChange);
        service.updateInterval(1, false);
        interval = service.getCurrentInterval(1);
      }

      expect(interval).toBeLessThanOrEqual(service.maxInterval);
    });
  });

  describe('Request Deduplication', () => {
    it('should prevent concurrent requests', async () => {
      mockFetch.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 1, status: 'preparing' }), 100))
      );

      service.markRequestStart(1);
      expect(service.isRequestInFlight(1)).toBe(true);

      service.markRequestEnd(1);
      expect(service.isRequestInFlight(1)).toBe(false);
    });
  });

  describe('Batch Polling', () => {
    it('should batch poll multiple orders', async () => {
      mockFetch.mockResolvedValue([
        { id: 1, status: 'preparing' },
        { id: 2, status: 'ready' },
        { id: 3, status: 'preparing' }
      ]);

      const results = await service.batchPollOrderStatus([1, 2, 3], mockFetch);

      expect(results.length).toBe(3);
      expect(mockFetch).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should use cache for batch polls', async () => {
      mockFetch.mockResolvedValue([
        { id: 1, status: 'preparing' },
        { id: 2, status: 'ready' }
      ]);

      // First call
      await service.batchPollOrderStatus([1, 2], mockFetch);
      
      // Second call should use cache for both
      const results = await service.batchPollOrderStatus([1, 2], mockFetch);

      expect(results.length).toBe(2);
      expect(results.every(r => r.cached)).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup order polling data', async () => {
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      await service.pollOrderStatus(1, mockFetch);
      expect(service.statusCache.size).toBe(1);

      service.cleanupOrder(1);
      expect(service.statusCache.size).toBe(0);
      expect(service.pollIntervals.has(1)).toBe(false);
    });

    it('should clear all data', async () => {
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      await service.pollOrderStatus(1, mockFetch);
      await service.pollOrderStatus(2, mockFetch);

      service.clearAll();

      expect(service.statusCache.size).toBe(0);
      expect(service.pollIntervals.size).toBe(0);
    });
  });

  describe('Metrics', () => {
    it('should track polling metrics', async () => {
      mockFetch.mockResolvedValue({ id: 1, status: 'preparing' });

      await service.pollOrderStatus(1, mockFetch);
      await service.pollOrderStatus(1, mockFetch);
      await service.pollOrderStatus(1, mockFetch);

      const metrics = service.getMetrics();

      expect(metrics.totalPolls).toBe(3);
      expect(metrics.cacheHits).toBe(2);
      expect(metrics.cacheMisses).toBe(1);
    });

    it('should report health status', async () => {
      const health = service.getHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('totalCached');
      expect(health).toHaveProperty('inFlight');
      expect(health).toHaveProperty('errorRate');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.pollOrderStatus(1, mockFetch)
      ).rejects.toThrow('DB Error');

      expect(service.getMetrics().errors).toBe(1);
    });

    it('should handle missing orders', async () => {
      mockFetch.mockResolvedValue(null);

      await expect(
        service.pollOrderStatus(999, mockFetch)
      ).rejects.toThrow('not found');
    });
  });

  describe('Status Change Detection', () => {
    it('should detect status changes', async () => {
      mockFetch.mockResolvedValueOnce({ id: 1, status: 'preparing' });
      mockFetch.mockResolvedValueOnce({ id: 1, status: 'ready' });

      service.cacheTTL = 0; // Disable cache for this test

      const result1 = await service.pollOrderStatus(1, mockFetch);
      expect(result1.changed).toBe(false); // First poll, no previous status

      const result2 = await service.pollOrderStatus(1, mockFetch);
      expect(result2.changed).toBe(true);
    });
  });
});
