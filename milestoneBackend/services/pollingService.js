/**
 * Order Polling Service
 * Handles server-side polling logic with exponential backoff and caching
 * 
 * Features:
 * - Configurable polling interval
 * - Exponential backoff when order status hasn't changed
 * - In-memory caching with TTL
 * - Request deduplication
 * - Health checks and metrics
 */

class PollingService {
  constructor(options = {}) {
    // Configuration
    this.minInterval = options.minInterval || 1000; // 1 second
    this.maxInterval = options.maxInterval || 30000; // 30 seconds
    this.backoffMultiplier = options.backoffMultiplier || 1.5;
    this.cacheTTL = options.cacheTTL || 5000; // 5 seconds
    this.maxConsecutiveNoChange = options.maxConsecutiveNoChange || 5; // Increase interval after 5 no-changes

    // In-memory caches
    this.statusCache = new Map(); // orderId -> { status, timestamp, lastChange }
    this.pollIntervals = new Map(); // orderId -> currentInterval
    this.noChangeCount = new Map(); // orderId -> consecutive no-change count
    this.inFlightRequests = new Set(); // Track in-flight requests

    // Metrics
    this.metrics = {
      totalPolls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      statusChanges: 0,
      errors: 0
    };
  }

  /**
   * Get cached status if valid
   * @param {number} orderId
   * @returns {Object|null} Cached status or null if expired
   */
  getCachedStatus(orderId) {
    const cached = this.statusCache.get(orderId);
    
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.statusCache.delete(orderId);
      return null;
    }

    this.metrics.cacheHits++;
    return cached.status;
  }

  /**
   * Set cached status
   * @param {number} orderId
   * @param {Object} status
   */
  setCachedStatus(orderId, status) {
    this.statusCache.set(orderId, {
      status,
      timestamp: Date.now(),
      lastChange: status
    });
  }

  /**
   * Get current polling interval for an order
   * Uses exponential backoff when status doesn't change
   * @param {number} orderId
   * @returns {number} Interval in milliseconds
   */
  getCurrentInterval(orderId) {
    return this.pollIntervals.get(orderId) || this.minInterval;
  }

  /**
   * Update polling interval based on status changes
   * @param {number} orderId
   * @param {boolean} statusChanged
   */
  updateInterval(orderId, statusChanged) {
    const currentInterval = this.getCurrentInterval(orderId);

    if (statusChanged) {
      // Reset to minimum interval on status change
      this.pollIntervals.set(orderId, this.minInterval);
      this.noChangeCount.set(orderId, 0);
    } else {
      // Increase interval with exponential backoff
      const noChangeCount = (this.noChangeCount.get(orderId) || 0) + 1;
      this.noChangeCount.set(orderId, noChangeCount);

      if (noChangeCount >= this.maxConsecutiveNoChange) {
        const newInterval = Math.min(
          currentInterval * this.backoffMultiplier,
          this.maxInterval
        );
        this.pollIntervals.set(orderId, newInterval);
      }
    }
  }

  /**
   * Check if request is already in flight
   * Prevents duplicate concurrent requests
   * @param {number} orderId
   * @returns {boolean}
   */
  isRequestInFlight(orderId) {
    return this.inFlightRequests.has(orderId);
  }

  /**
   * Mark request as in flight
   * @param {number} orderId
   */
  markRequestStart(orderId) {
    this.inFlightRequests.add(orderId);
  }

  /**
   * Mark request as complete
   * @param {number} orderId
   */
  markRequestEnd(orderId) {
    this.inFlightRequests.delete(orderId);
  }

  /**
   * Poll order status with all optimizations
   * @param {number} orderId
   * @param {Function} fetchFn - Function to fetch status from DB
   * @returns {Promise<Object>} { status, interval, changed, cached }
   */
  async pollOrderStatus(orderId, fetchFn) {
    this.metrics.totalPolls++;

    // Check cache first
    const cachedStatus = this.getCachedStatus(orderId);
    if (cachedStatus) {
      return {
        status: cachedStatus,
        interval: this.getCurrentInterval(orderId),
        changed: false,
        cached: true
      };
    }

    this.metrics.cacheMisses++;

    // Prevent duplicate concurrent requests
    if (this.isRequestInFlight(orderId)) {
      return {
        error: 'Request already in flight',
        interval: this.getCurrentInterval(orderId),
        cached: true
      };
    }

    try {
      this.markRequestStart(orderId);
      const status = await fetchFn(orderId);

      if (!status) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Check if status changed
      const cached = this.statusCache.get(orderId);
      const statusChanged = !cached || cached.status.status !== status.status;

      if (statusChanged) {
        this.metrics.statusChanges++;
      }

      // Update interval based on change
      this.updateInterval(orderId, statusChanged);

      // Cache the new status
      this.setCachedStatus(orderId, status);

      return {
        status,
        interval: this.getCurrentInterval(orderId),
        changed: statusChanged,
        cached: false
      };
    } catch (error) {
      this.metrics.errors++;
      throw error;
    } finally {
      this.markRequestEnd(orderId);
    }
  }

  /**
   * Batch poll multiple orders
   * More efficient than polling individually
   * @param {number[]} orderIds
   * @param {Function} fetchFn - Function to fetch statuses from DB
   * @returns {Promise<Object[]>} Results for each order
   */
  async batchPollOrderStatus(orderIds, fetchFn) {
    const results = [];

    // Check cache for all
    const uncachedIds = [];
    for (const orderId of orderIds) {
      const cached = this.getCachedStatus(orderId);
      if (cached) {
        results.push({
          orderId,
          status: cached,
          interval: this.getCurrentInterval(orderId),
          cached: true
        });
      } else {
        uncachedIds.push(orderId);
      }
    }

    // Fetch uncached
    if (uncachedIds.length > 0) {
      try {
        const statuses = await fetchFn(uncachedIds);
        
        for (const status of statuses) {
          this.setCachedStatus(status.id, status);
          results.push({
            orderId: status.id,
            status,
            interval: this.getCurrentInterval(status.id),
            cached: false
          });
        }
      } catch (error) {
        this.metrics.errors++;
        throw error;
      }
    }

    return results;
  }

  /**
   * Clean up order polling data
   * Call when order reaches terminal state (completed/cancelled)
   * @param {number} orderId
   */
  cleanupOrder(orderId) {
    this.statusCache.delete(orderId);
    this.pollIntervals.delete(orderId);
    this.noChangeCount.delete(orderId);
    this.inFlightRequests.delete(orderId);
  }

  /**
   * Clear all polling data
   * Use with caution (e.g., for testing)
   */
  clearAll() {
    this.statusCache.clear();
    this.pollIntervals.clear();
    this.noChangeCount.clear();
    this.inFlightRequests.clear();
  }

  /**
   * Get service metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    const cacheSize = this.statusCache.size;
    const inFlight = this.inFlightRequests.size;

    return {
      ...this.metrics,
      cacheSize,
      inFlight,
      cacheHitRate: this.metrics.totalPolls > 0 
        ? ((this.metrics.cacheHits / this.metrics.totalPolls) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Calculate next poll time
   * @param {number} orderId
   * @returns {number} Milliseconds until next poll
   */
  getNextPollTime(orderId) {
    return this.getCurrentInterval(orderId);
  }

  /**
   * Health check for polling service
   * @returns {Object} Health status
   */
  getHealth() {
    const totalCached = this.statusCache.size;
    const errorRate = this.metrics.totalPolls > 0
      ? ((this.metrics.errors / this.metrics.totalPolls) * 100).toFixed(2)
      : 0;

    return {
      status: this.metrics.errors === 0 ? 'healthy' : 'degraded',
      totalCached,
      inFlight: this.inFlightRequests.size,
      errorRate: errorRate + '%',
      metrics: this.getMetrics()
    };
  }
}

// Singleton instance
let instance = null;

function createPollingService(options = {}) {
  if (!instance) {
    instance = new PollingService(options);
  }
  return instance;
}

function getPollingService() {
  if (!instance) {
    instance = new PollingService();
  }
  return instance;
}

module.exports = {
  PollingService,
  createPollingService,
  getPollingService
};
