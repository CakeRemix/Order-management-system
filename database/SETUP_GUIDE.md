# Quick Setup Guide - Refactored Database

## Prerequisites
- PostgreSQL 12+ installed
- Database created (e.g., `giu_food_truck`)
- PostgreSQL user with appropriate permissions

## Setup Steps

### 1. Connect to PostgreSQL
```bash
psql -U postgres -d giu_food_truck
```

### 2. Run Schema Creation
```sql
\i database/schema.sql
```

This will:
- Drop and recreate the `FoodTruck` schema
- Create all 7 entity tables
- Create all 8 junction tables
- Set up all foreign key constraints
- Add indexes for performance
- Add table comments

### 3. Seed the Database
```sql
\i database/seeds/seed_all.sql
```

Or run individually:
```sql
\i database/seeds/01_seed_users.sql
\i database/seeds/02_seed_food_trucks.sql
\i database/seeds/03_seed_menu_items.sql
\i database/seeds/04_seed_orders.sql
```

### 4. Verify Installation
```sql
-- Check schema exists
\dn FoodTruck

-- List all tables
\dt FoodTruck.*

-- Count records in each table
SELECT 'Users' as table_name, COUNT(*) as count FROM FoodTruck.Users
UNION ALL
SELECT 'Trucks', COUNT(*) FROM FoodTruck.Trucks
UNION ALL
SELECT 'MenuItems', COUNT(*) FROM FoodTruck.MenuItems
UNION ALL
SELECT 'Orders', COUNT(*) FROM FoodTruck.Orders
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM FoodTruck.OrderItems
UNION ALL
SELECT 'Carts', COUNT(*) FROM FoodTruck.Carts
UNION ALL
SELECT 'Sessions', COUNT(*) FROM FoodTruck.Sessions;
```

Expected results:
- Users: 19 records (5 truck owners + 14 customers)
- Trucks: 5 records
- MenuItems: 45 records (9 per truck)
- Orders: 3 records
- OrderItems: 5+ records
- Carts: 0 records (empty initially)
- Sessions: 0 records (empty initially)

### 5. Test Queries

#### Get all trucks with owner information:
```sql
SELECT 
    t.truckName,
    u.name as ownerName,
    u.email as ownerEmail,
    t.truckStatus,
    t.orderStatus
FROM FoodTruck.Trucks t
JOIN FoodTruck.Users u ON t.ownerId = u.userId;
```

#### Get menu items for a specific truck:
```sql
SELECT 
    m.itemId,
    m.name,
    m.price,
    m.category,
    m.status
FROM FoodTruck.MenuItems m
WHERE m.truckId = (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq')
ORDER BY m.category, m.name;
```

#### Get orders with customer and truck details:
```sql
SELECT 
    o.orderId,
    u.name as customerName,
    t.truckName,
    o.orderStatus,
    o.totalPrice,
    o.scheduledPickupTime
FROM FoodTruck.Orders o
JOIN FoodTruck.Users u ON o.userId = u.userId
JOIN FoodTruck.Trucks t ON o.truckId = t.truckId
ORDER BY o.createdAt DESC;
```

#### Get order items for a specific order:
```sql
SELECT 
    oi.name,
    oi.quantity,
    oi.price,
    (oi.quantity * oi.price) as subtotal
FROM FoodTruck.OrderItems oi
JOIN FoodTruck.Order_Contains_OrderItems ocoi ON oi.orderItemId = ocoi.orderItemId
WHERE ocoi.orderId = 1;
```

## Common Issues & Solutions

### Issue: Schema already exists
```sql
-- Solution: Drop and recreate
DROP SCHEMA IF EXISTS FoodTruck CASCADE;
\i database/schema.sql
```

### Issue: Permission denied
```sql
-- Grant permissions to your user
GRANT ALL PRIVILEGES ON SCHEMA FoodTruck TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA FoodTruck TO your_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA FoodTruck TO your_username;
```

### Issue: Foreign key constraint violations
- Make sure to run seed files in order:
  1. Users first (no dependencies)
  2. Trucks second (depends on Users)
  3. MenuItems third (depends on Trucks)
  4. Orders last (depends on Users and Trucks)

## Database Configuration for Node.js

Update your `database/config/db.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'giu_food_truck',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  // Set search path to FoodTruck schema
  options: '-c search_path=FoodTruck,public'
});

// Alternatively, set search path on each query
pool.on('connect', (client) => {
  client.query('SET search_path TO FoodTruck, public');
});

module.exports = pool;
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=giu_food_truck
DB_PASSWORD=your_password_here
DB_PORT=5432
```

## Next Steps

1. Update backend controllers to use new table/column names
2. Update API routes
3. Test all CRUD operations
4. Update frontend to match new API structure
5. Run integration tests

## Rollback

If you need to rollback to the old schema:

```bash
# Restore from backup (if you created one)
psql -U postgres -d giu_food_truck < backup.sql

# Or manually drop the FoodTruck schema
DROP SCHEMA IF EXISTS FoodTruck CASCADE;
```

## Support

For questions or issues:
1. Check `database/REFACTORING_SUMMARY.md` for detailed changes
2. Review `docs/Database tables/tables.tex` for table specifications
3. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-XX-main.log`
