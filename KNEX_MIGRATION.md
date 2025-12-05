# Knex Query Builder Migration Guide

## Overview
The backend has been migrated from raw SQL queries (using `pg` library) to **Knex Query Builder** as recommended for better maintainability, security, and consistency.

## What Changed

### 1. Database Configuration
**Before** (`backend/config/db.js`):
```javascript
const { Pool } = require('pg');
const pool = new Pool({ /* config */ });
module.exports = { query: (text, params) => pool.query(text, params), pool };
```

**After** (`backend/config/db.js`):
```javascript
const knex = require('knex');
const db = knex({
  client: 'pg',
  connection: { /* config */ },
  searchPath: ['FoodTruck', 'public']
});
module.exports = db;
```

### 2. Package Dependencies
Added `knex` to `package.json`:
```json
"dependencies": {
  "knex": "^3.1.0",
  // ... other dependencies
}
```

### 3. Query Syntax Migration

#### Authentication Controller (`authController.js`)

**Login - Before:**
```javascript
const result = await db.query(
  'SELECT id, email, password, name, role FROM users WHERE email = $1',
  [email]
);
const user = result.rows[0];
```

**Login - After (Knex):**
```javascript
const user = await db('FoodTruck.Users')
  .select('userId as id', 'email', 'password', 'name', 'role')
  .where({ email })
  .first();
```

**Signup - Before:**
```javascript
const existingUser = await db.query(
  'SELECT id FROM users WHERE email = $1',
  [email]
);
if (existingUser.rows.length > 0) { /* ... */ }

const result = await db.query(
  'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
  [name, email, hashedPassword, role || 'customer']
);
const newUser = result.rows[0];
```

**Signup - After (Knex):**
```javascript
const existingUser = await db('FoodTruck.Users')
  .select('userId')
  .where({ email })
  .first();
if (existingUser) { /* ... */ }

const [newUser] = await db('FoodTruck.Users')
  .insert({
    name,
    email,
    password: hashedPassword,
    role: role || 'customer',
    birthDate: new Date()
  })
  .returning(['userId as id', 'name', 'email', 'role']);
```

#### Trucks Controller (`trucksController.js`)

**Get All Trucks - Before:**
```javascript
const query = `
  SELECT id, name, description, location, image_url, status
  FROM food_trucks
  WHERE is_active = TRUE
  ORDER BY name ASC
`;
const result = await db.query(query);
```

**Get All Trucks - After (Knex):**
```javascript
const trucks = await db('FoodTruck.Trucks')
  .select(
    'truckId as id',
    'truckName as name',
    'truckLogo as image_url',
    'truckStatus as status'
  )
  .orderBy('truckName', 'asc');
```

**Get Menu Items - Before:**
```javascript
const menuQuery = `
  SELECT id, name, description, price, category
  FROM menu_items
  WHERE food_truck_id = $1 AND is_active = TRUE
  ORDER BY category ASC, name ASC
`;
const menuResult = await db.query(menuQuery, [id]);
```

**Get Menu Items - After (Knex):**
```javascript
const menuItems = await db('FoodTruck.MenuItems')
  .select('itemId as id', 'name', 'description', 'price', 'category')
  .where({ truckId: id })
  .orderBy(['category', 'name']);
```

## Knex Query Builder Syntax Examples

### Basic SELECT
```javascript
// Select all columns
await db('FoodTruck.Users').select('*');

// Select specific columns
await db('FoodTruck.Users').select('userId', 'name', 'email');

// Select with aliases
await db('FoodTruck.Users').select('userId as id', 'name');

// Get first result only
await db('FoodTruck.Users').where({ email }).first();
```

### WHERE Clauses
```javascript
// Simple where
await db('FoodTruck.Trucks').where({ truckId: 1 });

// Multiple conditions
await db('FoodTruck.Trucks').where({ 
  truckStatus: 'available', 
  orderStatus: 'available' 
});

// OR conditions
await db('FoodTruck.Orders')
  .where('orderStatus', 'pending')
  .orWhere('orderStatus', 'confirmed');

// Complex where
await db('FoodTruck.MenuItems')
  .where('price', '>', 50)
  .andWhere('category', 'Main Course');
```

### INSERT
```javascript
// Insert single record
await db('FoodTruck.Users').insert({
  name: 'John Doe',
  email: 'john@giu-uni.de',
  password: 'hashed_password',
  role: 'customer'
});

// Insert with RETURNING
const [user] = await db('FoodTruck.Users')
  .insert({ name, email, password })
  .returning(['userId as id', 'name', 'email']);

// Insert multiple records
await db('FoodTruck.MenuItems').insert([
  { truckId: 1, name: 'Item 1', price: 50 },
  { truckId: 1, name: 'Item 2', price: 60 }
]);
```

### UPDATE
```javascript
// Update with where
await db('FoodTruck.Trucks')
  .where({ truckId: 1 })
  .update({ truckStatus: 'unavailable' });

// Update with RETURNING
const [updatedOrder] = await db('FoodTruck.Orders')
  .where({ orderId: 5 })
  .update({ orderStatus: 'completed' })
  .returning('*');
```

### DELETE
```javascript
// Delete with where
await db('FoodTruck.Carts')
  .where({ userId: 1 })
  .delete();

// Delete with RETURNING
const deleted = await db('FoodTruck.Sessions')
  .where({ userId: 1 })
  .delete()
  .returning('*');
```

### JOINS
```javascript
// Inner join
await db('FoodTruck.Orders as o')
  .join('FoodTruck.Users as u', 'o.userId', 'u.userId')
  .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
  .select(
    'o.orderId',
    'u.name as customerName',
    't.truckName',
    'o.totalPrice'
  );

// Left join
await db('FoodTruck.Trucks as t')
  .leftJoin('FoodTruck.MenuItems as m', 't.truckId', 'm.truckId')
  .select('t.truckName')
  .count('m.itemId as itemCount')
  .groupBy('t.truckId', 't.truckName');
```

### Aggregations
```javascript
// Count
const count = await db('FoodTruck.Orders').count('* as total');

// Sum
const total = await db('FoodTruck.Orders')
  .where({ userId: 1 })
  .sum('totalPrice as total');

// Average
const avg = await db('FoodTruck.MenuItems')
  .avg('price as avgPrice');

// Group by
await db('FoodTruck.Orders')
  .select('truckId')
  .count('* as orderCount')
  .groupBy('truckId');
```

### ORDER BY and LIMIT
```javascript
// Order by
await db('FoodTruck.MenuItems')
  .orderBy('price', 'desc');

// Multiple order by
await db('FoodTruck.MenuItems')
  .orderBy(['category', { column: 'price', order: 'desc' }]);

// Limit and offset
await db('FoodTruck.Orders')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .offset(20);
```

### Transactions
```javascript
// Using transactions
const trx = await db.transaction();
try {
  const [order] = await trx('FoodTruck.Orders')
    .insert({ userId, truckId, totalPrice })
    .returning('*');
  
  await trx('FoodTruck.OrderItems').insert({
    name: 'Item',
    quantity: 2,
    price: 50
  });
  
  await trx('FoodTruck.Order_Contains_OrderItems').insert({
    orderId: order.orderId,
    orderItemId: 1
  });
  
  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

## Benefits of Knex

1. **SQL Injection Prevention**: Automatic query parameterization
2. **Database Agnostic**: Easy to switch databases
3. **Cleaner Code**: More readable than raw SQL
4. **Type Safety**: Better IDE autocomplete
5. **Query Building**: Dynamic query construction
6. **Migrations**: Built-in migration support
7. **Transactions**: Easy transaction management

## Installation

Run the following command to install Knex:
```bash
npm install knex
```

## Setup

The database configuration is in `backend/config/db.js`. Ensure your `.env` file has:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=giu_food_truck
```

## Testing Queries

You can test Knex queries in isolation:
```javascript
const db = require('./milestoneBackend/config/db');

// Test a query
db('FoodTruck.Users')
  .select('*')
  .then(users => console.log(users))
  .catch(err => console.error(err))
  .finally(() => db.destroy());
```

## Common Patterns

### Check if Record Exists
```javascript
const exists = await db('FoodTruck.Users')
  .where({ email })
  .first();
if (!exists) {
  // Create new record
}
```

### Get or Create
```javascript
let user = await db('FoodTruck.Users')
  .where({ email })
  .first();

if (!user) {
  [user] = await db('FoodTruck.Users')
    .insert({ name, email, password })
    .returning('*');
}
```

### Pagination
```javascript
const page = 1;
const perPage = 10;
const offset = (page - 1) * perPage;

const [items, [{ total }]] = await Promise.all([
  db('FoodTruck.Orders')
    .limit(perPage)
    .offset(offset),
  db('FoodTruck.Orders').count('* as total')
]);

return {
  data: items,
  pagination: {
    page,
    perPage,
    total: parseInt(total),
    pages: Math.ceil(total / perPage)
  }
};
```

## Migration Checklist

- [x] Install Knex package
- [x] Update database configuration
- [x] Migrate authController queries
- [x] Migrate trucksController queries
- [ ] Migrate any additional controllers
- [ ] Update models if they use raw SQL
- [ ] Test all API endpoints
- [ ] Update API documentation

## Resources

- [Knex.js Documentation](https://knexjs.org/)
- [Knex Query Builder](https://knexjs.org/guide/query-builder.html)
- [Knex Schema Builder](https://knexjs.org/guide/schema-builder.html)
- [Knex Migrations](https://knexjs.org/guide/migrations.html)
