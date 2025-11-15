# Database Documentation

## Overview
This directory contains the complete database schema, migrations, and seed data for the GIU Food Truck Order Management System.

## Database Structure

### Technology Stack
- **Database**: PostgreSQL 13+
- **ORM/Query Builder**: pg (node-postgres) - Direct SQL queries
- **Authentication**: bcrypt for password hashing
- **Schema Management**: SQL scripts

### Tables

#### 1. `users`
Stores all system users (customers, vendors, and administrators).

**Columns:**
- `id` - Primary key (auto-increment)
- `name` - User's full name
- `email` - Unique email (validated format)
- `password` - Bcrypt hashed password
- `role` - ENUM: 'customer', 'vendor', 'admin'
- `phone` - Optional contact number
- `is_active` - Account status
- `email_verified` - Email verification status
- `created_at`, `updated_at`, `last_login` - Timestamps

**Indexes:**
- `idx_users_email` - Fast email lookup
- `idx_users_role` - Filter by role
- `idx_users_active` - Filter active users

---

#### 2. `food_trucks`
Stores food truck information and operational details.

**Columns:**
- `id` - Primary key
- `name` - Unique truck name
- `description` - Truck description
- `location` - Campus location
- `image_url` - Truck image
- `vendor_id` - Foreign key to users (nullable)
- `status` - ENUM: 'open', 'busy', 'closed'
- `is_busy` - Quick busy flag
- `busy_until` - Timestamp when busy mode ends
- `operating_hours` - JSONB with hours per day
- `prep_time_minutes` - Average preparation time
- `is_active` - Active status
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_trucks_vendor` - Vendor lookup
- `idx_trucks_status` - Filter by status
- `idx_trucks_active` - Active trucks only

---

#### 3. `menu_items`
Stores menu items for each food truck.

**Columns:**
- `id` - Primary key
- `food_truck_id` - Foreign key to food_trucks
- `name` - Item name
- `description` - Item description
- `price` - Item price (NUMERIC 10,2)
- `image_url` - Item image
- `category` - Item category (e.g., 'Sandwiches', 'Drinks')
- `prep_time_minutes` - Preparation time
- `is_available` - Availability status
- `is_active` - Active status
- `stock_quantity` - Inventory count (NULL = unlimited)
- `calories` - Nutritional information
- `allergens` - Array of allergen strings
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_items_truck` - Truck's menu lookup
- `idx_items_available` - Filter available items
- `idx_items_category` - Filter by category

---

#### 4. `orders`
Stores customer orders with status tracking.

**Columns:**
- `id` - Primary key
- `customer_id` - Foreign key to users
- `food_truck_id` - Foreign key to food_trucks
- `order_number` - Human-readable unique identifier (ORD20251113000001)
- `status` - ENUM: 'received', 'preparing', 'ready', 'completed', 'cancelled'
- `subtotal`, `tax`, `total` - Pricing breakdown
- `pickup_time` - Scheduled pickup time
- `estimated_prep_time` - Minutes for preparation
- `actual_completion_time` - When order was completed
- `notes` - Customer instructions
- `cancellation_reason` - Why order was cancelled
- `is_paid` - Payment status
- `payment_method` - 'cash', 'card', 'university_account'
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_orders_customer` - Customer's orders
- `idx_orders_truck` - Truck's orders
- `idx_orders_status` - Filter by status
- `idx_orders_pickup_time` - Sort by pickup time

**Auto-generated Fields:**
- `order_number` - Automatically generated on insert (trigger)

---

#### 5. `order_items`
Stores individual items within each order (snapshot pricing).

**Columns:**
- `id` - Primary key
- `order_id` - Foreign key to orders
- `menu_item_id` - Foreign key to menu_items
- `item_name` - Snapshot of item name at order time
- `quantity` - Number of items
- `unit_price` - Price at time of order
- `subtotal` - quantity × unit_price
- `special_instructions` - Item-specific notes
- `created_at` - Timestamp

**Indexes:**
- `idx_order_items_order` - Order's items
- `idx_order_items_menu_item` - Menu item reference

---

### ENUMS

```sql
user_role: 'customer', 'vendor', 'admin'
order_status: 'received', 'preparing', 'ready', 'completed', 'cancelled'
truck_status: 'open', 'busy', 'closed'
```

---

### Views

#### `active_orders_view`
Comprehensive view of all non-completed orders with customer and truck details.

#### `menu_items_with_truck`
Menu items joined with truck information for easy browsing.

#### `vendor_stats`
Dashboard statistics for each food truck (orders, revenue, prep times).

---

### Functions

#### `calculate_order_total(order_id INTEGER) RETURNS NUMERIC`
Calculates the total price of an order from its items.

#### `can_truck_accept_orders(truck_id INTEGER) RETURNS BOOLEAN`
Checks if a food truck is accepting orders (status, busy mode).

#### `get_estimated_pickup_time(truck_id INTEGER) RETURNS TIMESTAMP`
Calculates estimated pickup time based on pending orders.

---

### Triggers

#### `update_updated_at_column()`
Automatically updates `updated_at` timestamp on row updates.
Applied to: users, food_trucks, menu_items, orders

#### `generate_order_number()`
Generates unique order number in format: ORD{YYYYMMDD}{000001}
Applied to: orders (before insert)

---

## Setup Instructions

### Prerequisites
- PostgreSQL 13 or higher installed
- PowerShell (for Windows setup script)
- Node.js and npm (for application)

### Installation

#### Option 1: Automated Setup (Windows PowerShell)

```powershell
# Navigate to database directory
cd database

# Run setup script
.\setup.ps1
```

The script will:
1. Load environment variables from `.env`
2. Create the database (if not exists)
3. Run schema.sql
4. Optionally seed with sample data

#### Option 2: Manual Setup

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE giu_food_truck_db;"

# Run schema
psql -U postgres -d giu_food_truck_db -f schema.sql

# Run seeds (optional)
cd seeds
psql -U postgres -d giu_food_truck_db -f seed_all.sql
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=giu_food_truck_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_EXPIRATION=24h

# Bcrypt Configuration
BCRYPT_ROUNDS=10

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## Sample Data

The seed scripts populate the database with:

### Users
- **2 Admins**: System admin, Dr. Iman Awaad
- **5 Vendors**: One for each food truck
- **8 Team Members**: Test customer accounts
- **6 Additional Students**: More test data
- **2 Staff Members**: Faculty test accounts

**Default Password**: `Test123!` (for all test users)

### Food Trucks
- **Demeshq** - Syrian cuisine (OPEN)
- **Container** - Fusion/Burgers (BUSY)
- **Essens** - Healthy food (CLOSED)
- **Ftar w Asha** - Egyptian breakfast/lunch (OPEN)
- **Loaded** - Loaded fries/comfort food (BUSY)

### Menu Items
- 9 items per truck (47 total)
- Various categories: Sandwiches, Main Dishes, Bowls, Drinks, Desserts
- Prices range from 5 LE to 120 LE

### Orders
- 10 sample orders in various states
- Mix of completed, ready, preparing, received, and cancelled
- Demonstrates different scenarios

---

## Common Queries

### Get all available menu items for a truck
```sql
SELECT * FROM menu_items_with_truck 
WHERE truck_id = 1 AND is_available = TRUE;
```

### Get customer's active orders
```sql
SELECT * FROM active_orders_view 
WHERE customer_id = 8 
ORDER BY pickup_time;
```

### Get vendor's pending orders
```sql
SELECT * FROM orders 
WHERE food_truck_id = 1 
  AND status IN ('received', 'preparing') 
ORDER BY pickup_time;
```

### Check if truck can accept orders
```sql
SELECT can_truck_accept_orders(1);
```

### Get estimated pickup time
```sql
SELECT get_estimated_pickup_time(1);
```

### Update order status
```sql
UPDATE orders 
SET status = 'preparing' 
WHERE id = 1;
```

---

## Backup & Restore

### Backup
```powershell
pg_dump -U postgres -d giu_food_truck_db -F c -f backup_$(Get-Date -Format "yyyyMMdd_HHmmss").dump
```

### Restore
```powershell
pg_restore -U postgres -d giu_food_truck_db -c backup_20251113_120000.dump
```

---

## Migration Strategy

For production deployments, consider using migration tools:

### Using node-pg-migrate
```bash
npm install -g node-pg-migrate

# Create migration
node-pg-migrate create add-ratings-table

# Run migrations
node-pg-migrate up
```

---

## Security Considerations

1. **Password Hashing**: All passwords use bcrypt with 10 rounds
2. **SQL Injection**: Use parameterized queries with pg library
3. **Email Validation**: Enforced at database level with CHECK constraint
4. **GIU Email Only**: Application layer validates GIU domain emails
5. **Soft Deletes**: Use `is_active` flag instead of DELETE
6. **Audit Trail**: `created_at` and `updated_at` on all tables

---

## Performance Optimization

1. **Indexes**: Strategic indexes on foreign keys and filter columns
2. **Views**: Pre-joined views for common queries
3. **Connection Pooling**: pg Pool configured in db.js (max 20 connections)
4. **EXPLAIN ANALYZE**: Use to optimize slow queries

---

## Troubleshooting

### Connection Issues
```powershell
# Test connection
psql -U postgres -d giu_food_truck_db -c "SELECT NOW();"
```

### Reset Database
```powershell
# Drop and recreate
psql -U postgres -c "DROP DATABASE giu_food_truck_db;"
cd database
.\setup.ps1
```

### Check Table Sizes
```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Database Diagram

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ↓              ↓              ↓
┌──────────────┐  ┌─────────┐  ┌─────────┐
│ food_trucks  │  │ orders  │  │ orders  │
│ (vendor_id)  │  │(customer)│  │(customer)│
└──────┬───────┘  └────┬────┘  └─────────┘
       │               │
       ↓               ↓
┌──────────────┐  ┌──────────────┐
│ menu_items   │  │ order_items  │
└──────────────┘  └──────────────┘
```

---

## Future Enhancements

- [ ] Add ratings and reviews tables
- [ ] Add inventory tracking table
- [ ] Add notifications table
- [ ] Add order history analytics
- [ ] Add vendor payout tracking
- [ ] Add promotional campaigns table
- [ ] Add favorites/wishlists for customers

---

## Contact & Support

For issues or questions:
- **Team**: Sleepers
- **Course**: Software Engineering (CSEN 303)
- **Instructor**: Dr. Iman Awaad

---

**Last Updated**: November 13, 2025
