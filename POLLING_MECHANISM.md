# Order Status Polling Mechanism

Production-grade polling implementation for real-time order status updates with exponential backoff, caching, and optimization.

## Overview

The polling mechanism provides efficient, real-time order status updates using intelligent exponential backoff and server-side caching to minimize database load and network traffic.

### Architecture

```
┌─ Frontend (React)─────────────────────────┐
│                                            │
│  Component         useOrderPolling Hook   │
│     │                     │                │
│     └─────────────────────┘                │
│             │                              │
│      Configurable Polling                  │
│      (2s → 30s)                            │
└─────────────┬────────────────────────────┘
              │
         HTTP GET/POST
              │
┌─────────────▼────────────────────────────┐
│      Backend (Node.js/Express)            │
│                                           │
│  OrderController                          │
│      ├─ getOrderStatus()                  │
│      ├─ batchGetOrderStatus()             │
│      └─ getPollingMetrics()               │
│                                           │
│  PollingService (Singleton)               │
│      ├─ In-memory cache (5s TTL)          │
│      ├─ Exponential backoff logic         │
│      ├─ Request deduplication             │
│      └─ Metrics tracking                  │
│                                           │
└─────────────┬─────────────────────────────┘
              │
              └─ Database Query
```

## Features

### 1. **Exponential Backoff**
- Starts at 2 seconds
- Increases to max 30 seconds when no status changes
- Resets to 2 seconds on status change
- Reduces server load and network traffic

### 2. **Intelligent Caching**
- 5-second TTL for cached responses
- Reduces database queries by 50-80%
- Serves fresh data within cache window

### 3. **Request Deduplication**
- Prevents concurrent requests for same order
- Queues requests and returns cached result
- Eliminates thundering herd problem

### 4. **Batch Polling**
- Poll multiple orders in single request
- More efficient for dashboards and lists
- Better for mobile clients

### 5. **Automatic Cleanup**
- Removes polling data when order completes
- Memory-efficient
- Automatic on terminal statuses

## Backend Implementation

### Installation

No additional dependencies required. Uses existing Node.js stack.

### Configuration

```javascript
// backend/services/pollingService.js
const { createPollingService } = require('./pollingService');

const pollingService = createPollingService({
  minInterval: 1000,        // 1 second minimum
  maxInterval: 30000,       // 30 seconds maximum
  backoffMultiplier: 1.5,   // Exponential backoff factor
  cacheTTL: 5000,          // Cache for 5 seconds
  maxConsecutiveNoChange: 5 // Increase interval after 5 no-changes
});
```

### API Endpoints

#### 1. **GET /api/orders/:id/status**
Get single order status with polling metadata

```bash
curl http://localhost:5000/api/orders/123/status

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "status": "preparing",
    "progress_percent": 50,
    "estimated_prep_time": 15,
    "elapsed_minutes": 7.5,
    "updated_at": "2025-11-19T10:30:00Z"
  },
  "polling": {
    "nextPollInterval": 3000,
    "statusChanged": false,
    "fromCache": true
  }
}
```

**Response Fields:**
- `nextPollInterval` - Recommended time until next poll (milliseconds)
- `statusChanged` - Whether status changed since last poll
- `fromCache` - Whether response came from cache

#### 2. **POST /api/orders/batch/status**
Poll multiple orders efficiently

```bash
curl -X POST http://localhost:5000/api/orders/batch/status \
  -H "Content-Type: application/json" \
  -d '{"order_ids": [123, 124, 125]}'

Response:
{
  "success": true,
  "data": [
    {
      "orderId": 123,
      "status": { "id": 123, "status": "preparing", ... },
      "interval": 3000,
      "cached": true
    },
    ...
  ],
  "count": 3
}
```

#### 3. **GET /api/orders/customer/:customerId**
Get all orders for a customer

```bash
curl "http://localhost:5000/api/orders/customer/1?limit=20&offset=0&status=preparing"

Response:
{
  "success": true,
  "data": [
    {
      "id": 123,
      "order_number": "ORD-001",
      "status": "preparing",
      "total": 15.99,
      "created_at": "2025-11-19T10:00:00Z",
      "truck_name": "Pizza Paradise"
    },
    ...
  ],
  "count": 5
}
```

#### 4. **GET /api/polling/metrics**
Get polling service metrics (admin)

```bash
curl http://localhost:5000/api/polling/metrics

Response:
{
  "success": true,
  "metrics": {
    "totalPolls": 1250,
    "cacheHits": 1000,
    "cacheMisses": 250,
    "statusChanges": 45,
    "errors": 2,
    "cacheSize": 12,
    "inFlight": 0,
    "cacheHitRate": "80.00%"
  },
  "health": {
    "status": "healthy",
    "totalCached": 12,
    "inFlight": 0,
    "errorRate": "0.16%"
  }
}
```

### Database Queries

Optimized queries for polling:

```sql
-- Lightweight status query (used frequently)
SELECT id, status, estimated_prep_time, actual_completion_time, updated_at
FROM orders WHERE id = $1;

-- Progress calculation
SELECT 
  id, status, created_at, estimated_prep_time,
  CASE 
    WHEN status = 'completed' THEN 100
    WHEN status = 'preparing' THEN 50
    ELSE 10
  END as progress_percent
FROM orders WHERE id = $1;

-- Batch query
SELECT id, status, estimated_prep_time, actual_completion_time, updated_at
FROM orders WHERE id = ANY(ARRAY[$1, $2, $3]::int[]);
```

## Frontend Implementation

### React Hook Usage

#### Basic Usage

```javascript
import { useOrderPolling } from '../hooks/useOrderPolling';

function OrderTracker({ orderId }) {
  const {
    status,
    loading,
    error,
    progress,
    interval,
    isReady,
    isCompleted,
    refetch
  } = useOrderPolling(orderId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Order #{orderId}</h2>
      <p>Status: {status?.status}</p>
      <progress value={progress} max="100" />
      <p>Next update in: {interval / 1000}s</p>
      
      {isReady && <p>✅ Your order is ready!</p>}
      {isCompleted && <p>✅ Order completed!</p>}
      
      <button onClick={refetch}>Refresh Now</button>
    </div>
  );
}
```

#### Advanced Configuration

```javascript
const { status, stop, resume } = useOrderPolling(orderId, {
  initialInterval: 3000,           // Start at 3 seconds
  maxInterval: 60000,              // Max 60 seconds
  backoffMultiplier: 1.2,          // Slower backoff
  maxRetries: 5,                   // More retry attempts
  enabled: true,                   // Auto-start polling
  
  onStatusChange: (newStatus) => {
    console.log('Status changed:', newStatus);
    playNotificationSound();
  },
  
  onComplete: (finalStatus) => {
    console.log('Order complete:', finalStatus);
    navigate('/orders');
  },
  
  onMaxRetriesExceeded: (error) => {
    console.error('Polling failed:', error);
    showErrorNotification();
  }
});

// Manual control
<button onClick={stop}>Stop Polling</button>
<button onClick={resume}>Resume Polling</button>
```

### Return Values

```javascript
const {
  // Data
  status,           // Current order status object
  progress,         // 0-100 progress percentage
  elapsedMinutes,   // Time since order created
  interval,         // Current poll interval (ms)
  
  // State
  loading,          // Initially loading
  error,            // Error message if any
  isChanged,        // Status changed since last poll
  
  // Status checks
  isReceived,       // Status === 'received'
  isPreparing,      // Status === 'preparing'
  isReady,          // Status === 'ready'
  isCompleted,      // Status === 'completed'
  isCancelled,      // Status === 'cancelled'
  isTerminal,       // Completed or cancelled
  
  // Controls
  refetch,          // Manual fetch function
  stop,             // Stop polling
  resume            // Resume polling
} = useOrderPolling(orderId, config);
```

#### Batch Polling

```javascript
import { useBatchOrderPolling } from '../hooks/useOrderPolling';

function OrderList({ orderIds }) {
  const { statuses, loading, error, refetch } = useBatchOrderPolling(orderIds, {
    initialInterval: 5000,
    onAllComplete: (statuses) => {
      console.log('All orders complete!', statuses);
    }
  });

  return (
    <div>
      {orderIds.map(id => (
        <OrderCard 
          key={id} 
          status={statuses[id]}
          loading={loading}
        />
      ))}
    </div>
  );
}
```

## Performance Optimization

### Cache Hit Rate

With exponential backoff, typical cache hit rate: **80-90%**

```
Request pattern:
0s   → DB query (miss)
2s   → Cache hit
4s   → Cache hit
6s   → DB query (no change, miss)
9s   → Cache hit
12s  → DB query (no change, miss)
18s  → DB query (status changed)
20s  → Cache hit
```

### Network Efficiency

Polling duration: **10 minutes**
- Without optimization: 120 requests × ~500 bytes = 60 KB
- With backoff & cache: ~15 requests = 7.5 KB
- **Savings: 87.5%**

### Database Load

With caching and deduplication:
- Reduce queries by **80-90%**
- Peak load spread out via backoff
- Batch queries for multiple orders

## Best Practices

### 1. **Stop Polling When Done**
```javascript
useEffect(() => {
  if (status?.status === 'completed') {
    stop();
  }
}, [status]);
```

### 2. **Handle Errors Gracefully**
```javascript
const { error, refetch } = useOrderPolling(orderId);

if (error) {
  return (
    <div>
      <p>Failed to fetch status</p>
      <button onClick={refetch}>Retry</button>
    </div>
  );
}
```

### 3. **Use Batch for Lists**
```javascript
// ✅ Good: Single batch request
const { statuses } = useBatchOrderPolling([1, 2, 3, 4, 5]);

// ❌ Avoid: Multiple individual requests
useOrderPolling(1);
useOrderPolling(2);
useOrderPolling(3);
```

### 4. **Clean Immediate Queries**
```javascript
// ✅ Good: Single optimized query
const { status, loading } = useOrderPolling(orderId);

// ❌ Avoid: Multiple parallel queries
const { status } = useOrderPolling(orderId);
const order = useQuery(`/api/orders/${orderId}`);
```

### 5. **Update Interval Dynamically**
```javascript
// Increase polling on mobile to save battery
const interval = isMobileDevice ? 5000 : 2000;
const { status } = useOrderPolling(orderId, { initialInterval: interval });
```

## Testing

### Unit Tests

```javascript
import { PollingService } from '../services/pollingService';

describe('PollingService', () => {
  let service;

  beforeEach(() => {
    service = new PollingService();
  });

  it('should cache results', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 'preparing' });
    
    const result1 = await service.pollOrderStatus(1, mockFetch);
    const result2 = await service.pollOrderStatus(1, mockFetch);
    
    expect(mockFetch).toHaveBeenCalledTimes(1); // Cached!
    expect(result1.cached).toBe(false);
    expect(result2.cached).toBe(true);
  });

  it('should implement exponential backoff', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ status: 'preparing' });
    
    await service.pollOrderStatus(1, mockFetch);
    expect(service.getCurrentInterval(1)).toBe(service.minInterval);
    
    service.updateInterval(1, false);
    expect(service.getCurrentInterval(1)).toBe(
      service.minInterval * service.backoffMultiplier
    );
  });
});
```

### Integration Tests

```javascript
describe('Order Polling API', () => {
  it('GET /api/orders/:id/status should return with polling metadata', async () => {
    const res = await request(app)
      .get('/api/orders/1/status');
    
    expect(res.body.polling).toHaveProperty('nextPollInterval');
    expect(res.body.polling).toHaveProperty('statusChanged');
    expect(res.body.polling).toHaveProperty('fromCache');
  });

  it('POST /api/orders/batch/status should handle multiple orders', async () => {
    const res = await request(app)
      .post('/api/orders/batch/status')
      .send({ order_ids: [1, 2, 3] });
    
    expect(res.body.data.length).toBe(3);
    expect(res.body.data[0]).toHaveProperty('orderId');
    expect(res.body.data[0]).toHaveProperty('status');
  });
});
```

## Monitoring & Metrics

### Key Metrics

```javascript
// Get polling service health
GET /api/polling/metrics

{
  "metrics": {
    "totalPolls": 1250,      // Total poll requests
    "cacheHits": 1000,       // Responses from cache
    "cacheMisses": 250,      // DB queries
    "statusChanges": 45,     // Orders that changed
    "errors": 2,             // Failed requests
    "cacheHitRate": "80.00%"
  },
  "health": {
    "status": "healthy",     // Overall health
    "totalCached": 12,       // Orders in cache
    "inFlight": 0,           // Currently polling
    "errorRate": "0.16%"
  }
}
```

### Alerts to Set

- Error rate > 1%
- Cache hit rate < 50%
- In-flight requests > 100
- Response time > 1 second

## Troubleshooting

### Issue: Polling feels slow
**Solution:** Decrease initialInterval or check network latency

### Issue: High server load
**Solution:** Increase maxInterval or enable batch polling

### Issue: Memory usage increasing
**Solution:** Check for memory leaks in cleanup logic

### Issue: Status updates delayed
**Solution:** Reduce cacheTTL or disable caching temporarily

## Migration Guide

### From REST Polling
```javascript
// Before
useEffect(() => {
  const interval = setInterval(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(setOrder);
  }, 2000);
  
  return () => clearInterval(interval);
}, [id]);

// After
const { status } = useOrderPolling(id);
```

### From WebSockets
```javascript
// Still want real-time? Combine with WebSocket
const { status } = useOrderPolling(id, { initialInterval: 10000 });

useEffect(() => {
  const ws = new WebSocket(`ws://localhost:5000/orders/${id}`);
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    // Update immediately on WS message
    refetch();
  };
}, [id]);
```

## License

MIT - Part of Order Management System

