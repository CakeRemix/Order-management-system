# Order Polling Mechanism - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Start the Backend
```bash
npm install
npm start
```

Server runs on `http://localhost:5000`

### Step 2: Create a Test Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "food_truck_id": 1,
    "order_number": "ORD-TEST-001",
    "subtotal": 15.00,
    "tax": 1.50,
    "total": 16.50,
    "pickup_time": "2025-11-19T15:00:00Z",
    "estimated_prep_time": 15
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "received",
    "order_number": "ORD-TEST-001"
  }
}
```

### Step 3: Test Polling Endpoint
```bash
curl http://localhost:5000/api/orders/1/status
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "received",
    "progress_percent": 10,
    "estimated_prep_time": 15,
    "elapsed_minutes": 0.1,
    "updated_at": "2025-11-19T10:00:00Z"
  },
  "polling": {
    "nextPollInterval": 2000,
    "statusChanged": false,
    "fromCache": false
  }
}
```

### Step 4: Update Order Status
```bash
curl -X PATCH http://localhost:5000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

### Step 5: Poll Again (Interval Resets)
```bash
curl http://localhost:5000/api/orders/1/status
```

Notice `statusChanged: true` and interval is back to 2000ms.

### Step 6: View Metrics
```bash
curl http://localhost:5000/api/polling/metrics
```

Response:
```json
{
  "success": true,
  "metrics": {
    "totalPolls": 5,
    "cacheHits": 2,
    "cacheMisses": 3,
    "statusChanges": 1,
    "errors": 0,
    "cacheSize": 1,
    "inFlight": 0,
    "cacheHitRate": "40.00%"
  },
  "health": {
    "status": "healthy",
    "totalCached": 1,
    "inFlight": 0,
    "errorRate": "0%"
  }
}
```

---

## 💻 Frontend Usage

### Basic Component Integration
```javascript
import OrderTracker from './components/OrderTracker';

export default function App() {
  return (
    <div>
      <h1>My Orders</h1>
      <OrderTracker orderId={1} />
    </div>
  );
}
```

### Using the Hook Directly
```javascript
import { useOrderPolling } from './hooks/useOrderPolling';

export default function OrderStatus({ orderId }) {
  const {
    status,
    loading,
    error,
    progress,
    isReady,
    refetch,
    stop
  } = useOrderPolling(orderId, {
    initialInterval: 2000,
    onStatusChange: (status) => {
      console.log('Status updated:', status);
    },
    onComplete: (status) => {
      console.log('Order complete!');
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Order #{orderId}</h2>
      <div>Status: {status?.status}</div>
      <progress value={progress} max="100" />
      {isReady && <p>✅ Ready for pickup!</p>}
      <button onClick={refetch}>Refresh</button>
      <button onClick={stop}>Stop Updates</button>
    </div>
  );
}
```

### Batch Polling Multiple Orders
```javascript
import { useBatchOrderPolling } from './hooks/useOrderPolling';

export default function OrderList({ orderIds }) {
  const { statuses, loading, error } = useBatchOrderPolling(orderIds, {
    initialInterval: 5000
  });

  return (
    <div>
      {orderIds.map(id => (
        <div key={id}>
          <h3>Order #{id}</h3>
          <p>Status: {statuses[id]?.status}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Run Tests

```bash
# All tests
npm test

# Polling tests only
npm test -- polling.test.js

# Order API tests only
npm test -- order.test.js

# With coverage
npm test -- --coverage
```

---

## 📊 Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/orders/:id/status` | Poll single order status |
| POST | `/api/orders/batch/status` | Poll multiple orders |
| GET | `/api/orders/:id` | Get full order details |
| GET | `/api/orders/customer/:customerId` | Get customer orders |
| POST | `/api/orders` | Create new order |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/polling/metrics` | View polling metrics |
| POST | `/api/polling/cleanup/:id` | Cleanup polling data |

---

## ⚙️ Configuration

### Backend (server.js)
```javascript
const { createPollingService } = require('./backend/services/pollingService');

const pollingService = createPollingService({
  minInterval: 1000,              // Start: 1s
  maxInterval: 30000,             // Max: 30s
  backoffMultiplier: 1.5,         // Multiplier
  cacheTTL: 5000,                 // Cache: 5s
  maxConsecutiveNoChange: 5       // Backoff after 5 no-changes
});
```

### Frontend Hook
```javascript
const { status } = useOrderPolling(orderId, {
  initialInterval: 2000,          // Start: 2s
  maxInterval: 30000,             // Max: 30s
  enabled: true,                  // Auto-start
  maxRetries: 3,                  // Retry attempts
  onStatusChange: (status) => {},       // Status changed callback
  onComplete: (status) => {},           // Order complete callback
  onMaxRetriesExceeded: (error) => {}   // Max retries callback
});
```

---

## 🔍 Debugging

### View Polling Metrics
```bash
curl http://localhost:5000/api/polling/metrics | jq
```

### Check Cache Status
```bash
curl http://localhost:5000/api/orders/1/status | jq '.polling'
```

### Enable Console Logging (Frontend)
```javascript
const { status } = useOrderPolling(orderId, {
  onStatusChange: (status) => {
    console.log('✅ Status changed:', status);
  },
  onComplete: (status) => {
    console.log('🎉 Order complete:', status);
  }
});
```

---

## 📈 Performance Tips

1. **Use Batch Polling for Lists**
   ```javascript
   // ✅ Good
   useBatchOrderPolling([1, 2, 3, 4, 5]);
   
   // ❌ Avoid
   useOrderPolling(1);
   useOrderPolling(2);
   useOrderPolling(3);
   ```

2. **Stop Polling When Not Needed**
   ```javascript
   const { status, stop } = useOrderPolling(orderId);
   
   useEffect(() => {
     if (status?.isTerminal) {
       stop(); // Stop when order is done
     }
   }, [status]);
   ```

3. **Adjust Intervals for Your Needs**
   ```javascript
   // Mobile (save battery)
   useOrderPolling(id, { initialInterval: 5000 });
   
   // Real-time dashboard
   useOrderPolling(id, { initialInterval: 1000 });
   ```

---

## 🐛 Troubleshooting

### "Order not found" Error
```bash
# Create an order first
curl -X POST http://localhost:5000/api/orders ...

# Check it exists
curl http://localhost:5000/api/orders/1
```

### Cache not working
```bash
# Verify cache hit rate
curl http://localhost:5000/api/polling/metrics | jq '.metrics.cacheHitRate'

# Should be > 50% after a few polls
```

### Frontend not updating
```javascript
// Check for errors
const { status, error } = useOrderPolling(id);
console.log('Error:', error);

// Manually refresh
const { refetch } = useOrderPolling(id);
refetch();
```

---

## 📚 Learn More

- **Full Documentation**: See `POLLING_MECHANISM.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Architecture**: See `POLLING_MECHANISM.md` → Architecture section
- **Best Practices**: See `POLLING_MECHANISM.md` → Best Practices section
- **Testing**: See `POLLING_MECHANISM.md` → Testing section

---

## ✅ Checklist

- [ ] Backend running: `npm start`
- [ ] Create test order: `curl -X POST /api/orders ...`
- [ ] Poll endpoint: `curl /api/orders/1/status`
- [ ] Update status: `curl -X PATCH /api/orders/1/status ...`
- [ ] View metrics: `curl /api/polling/metrics`
- [ ] Run tests: `npm test`
- [ ] Integrate component: Import `OrderTracker`
- [ ] Use hook: Import `useOrderPolling`

---

## 🎓 Next Steps

1. **Integrate into your app** → Import `OrderTracker` or `useOrderPolling`
2. **Customize styling** → Edit `OrderTracker.jsx`
3. **Configure intervals** → Adjust config in hook
4. **Add websockets** → Combine with WebSocket for real-time
5. **Monitor metrics** → Check `/api/polling/metrics` endpoint

---

**Ready to use! 🚀**

Questions? Check the full documentation in `POLLING_MECHANISM.md`
