/**
 * useOrderPolling Hook
 * React hook for polling order status with automatic interval management
 * 
 * Features:
 * - Automatic polling with configurable interval
 * - Exponential backoff when no changes
 * - Request deduplication
 * - Automatic cleanup
 * - Error handling and retry logic
 * 
 * @example
 * const { status, interval, loading, error, isChanged } = useOrderPolling(orderId, {
 *   initialInterval: 2000,
 *   maxInterval: 30000,
 *   enabled: true
 * });
 */

import { useEffect, useRef, useCallback, useState } from 'react';

const DEFAULT_CONFIG = {
  initialInterval: 2000, // Start with 2 seconds
  maxInterval: 30000, // Max 30 seconds
  backoffMultiplier: 1.5,
  maxRetries: 3,
  retryDelay: 1000,
  enabled: true
};

export function useOrderPolling(orderId, config = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [interval, setInterval] = useState(finalConfig.initialInterval);

  // Refs
  const timerRef = useRef(null);
  const lastStatusRef = useRef(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);

  /**
   * Fetch order status from API
   */
  const fetchOrderStatus = useCallback(async () => {
    // Prevent concurrent requests
    if (inFlightRef.current) {
      return;
    }

    try {
      inFlightRef.current = true;
      setError(null);

      const response = await fetch(`/api/orders/${orderId}/status`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      const newStatus = data.data;
      const statusChanged = lastStatusRef.current?.status !== newStatus.status;

      if (statusChanged) {
        setIsChanged(true);
        // Reset retry count on successful poll
        retryCountRef.current = 0;
        
        // Trigger optional callback
        if (finalConfig.onStatusChange) {
          finalConfig.onStatusChange(newStatus);
        }
      }

      // Update state
      setStatus(newStatus);
      lastStatusRef.current = newStatus;

      // Update interval from server response
      if (data.polling?.nextPollInterval) {
        setInterval(data.polling.nextPollInterval);
      }

      setLoading(false);

      // Stop polling if order is complete
      if (['completed', 'cancelled'].includes(newStatus.status)) {
        if (finalConfig.onComplete) {
          finalConfig.onComplete(newStatus);
        }
        return true; // Signal to stop polling
      }

      return false; // Continue polling
    } catch (err) {
      if (!isMountedRef.current) return;

      setError(err instanceof Error ? err.message : 'Unknown error');
      retryCountRef.current += 1;

      // Exponential backoff for retries
      if (retryCountRef.current >= finalConfig.maxRetries) {
        if (finalConfig.onMaxRetriesExceeded) {
          finalConfig.onMaxRetriesExceeded(err);
        }
        return true; // Stop polling after max retries
      }

      // Increase interval on error
      setInterval(prevInterval =>
        Math.min(prevInterval * finalConfig.backoffMultiplier, finalConfig.maxInterval)
      );

      return false; // Continue polling
    } finally {
      inFlightRef.current = false;
    }
  }, [orderId, finalConfig]);

  /**
   * Setup polling timer
   */
  useEffect(() => {
    if (!finalConfig.enabled || !orderId) {
      return;
    }

    // Initial fetch
    let shouldStop = false;
    (async () => {
      shouldStop = await fetchOrderStatus();
    })();

    // Setup recurring poll
    const setupTimer = () => {
      timerRef.current = setTimeout(async () => {
        const shouldStop = await fetchOrderStatus();

        if (!shouldStop && isMountedRef.current) {
          setupTimer(); // Recursively setup next timer
        }
      }, interval);
    };

    if (!shouldStop) {
      setupTimer();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [interval, orderId, finalConfig.enabled, fetchOrderStatus]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  /**
   * Manual refetch
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchOrderStatus();
  }, [fetchOrderStatus]);

  /**
   * Manual stop
   */
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Manual resume
   */
  const resume = useCallback(() => {
    if (!timerRef.current) {
      fetchOrderStatus();
    }
  }, [fetchOrderStatus]);

  return {
    // Status data
    status,
    loading,
    error,
    isChanged,
    interval,

    // Progress info
    progress: status?.progress_percent || 0,
    elapsedMinutes: status?.elapsed_minutes || 0,

    // Control functions
    refetch,
    stop,
    resume,

    // Status checks
    isReceived: status?.status === 'received',
    isPreparing: status?.status === 'preparing',
    isReady: status?.status === 'ready',
    isCompleted: status?.status === 'completed',
    isCancelled: status?.status === 'cancelled',
    isTerminal: ['completed', 'cancelled'].includes(status?.status)
  };
}

/**
 * Custom hook for batch polling multiple orders
 * More efficient than polling individually
 */
export function useBatchOrderPolling(orderIds, config = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interval, setInterval] = useState(finalConfig.initialInterval);

  const timerRef = useRef(null);
  const lastStatusesRef = useRef({});
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const fetchBatchStatus = useCallback(async () => {
    if (inFlightRef.current || !orderIds || orderIds.length === 0) {
      return;
    }

    try {
      inFlightRef.current = true;
      setError(null);

      const response = await fetch('/api/orders/batch/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: orderIds })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      // Transform response to map
      const newStatuses = {};
      data.data.forEach((item) => {
        newStatuses[item.orderId] = item.status;
      });

      setStatuses(newStatuses);
      lastStatusesRef.current = newStatuses;
      setLoading(false);

      // Check if all orders are complete
      const allTerminal = Object.values(newStatuses).every((s) =>
        ['completed', 'cancelled'].includes(s.status)
      );

      if (allTerminal && finalConfig.onAllComplete) {
        finalConfig.onAllComplete(newStatuses);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      inFlightRef.current = false;
    }
  }, [orderIds, finalConfig]);

  useEffect(() => {
    if (!finalConfig.enabled || !orderIds || orderIds.length === 0) {
      return;
    }

    fetchBatchStatus();

    timerRef.current = setInterval(() => {
      fetchBatchStatus();
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interval, orderIds, finalConfig.enabled, fetchBatchStatus]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    statuses,
    loading,
    error,
    interval,
    refetch: fetchBatchStatus
  };
}

export default useOrderPolling;
