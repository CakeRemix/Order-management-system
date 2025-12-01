# Database Refactoring Summary

## Overview
The database schema has been completely refactored to align with the specifications in `tables.tex` and meet Milestone 3 requirements.

## Schema Changes

### 1. Schema Namespace
- **Old**: Used default `public` schema
- **New**: Uses `FoodTruck` schema namespace
- All tables are now prefixed with `FoodTruck.`

### 2. Complete Table Structure (15 Tables Total)

#### Entity Tables (7):
1. **FoodTruck.Users** - User accounts (customers and truck owners)
   - Primary Key: `userId` (SERIAL)
   - Fields: name, email, password, role, birthDate, createdAt
   - Role: 'customer' or 'truckOwner'

2. **FoodTruck.Trucks** - Food truck information
   - Primary Key: `truckId` (SERIAL)
   - Fields: truckName, truckLogo, ownerId, truckStatus, orderStatus, createdAt
   - Foreign Key: ownerId → Users(userId)

3. **FoodTruck.MenuItems** - Menu items for each truck
   - Primary Key: `itemId` (SERIAL)
   - Fields: truckId, name, description, price, category, status, createdAt
   - Foreign Key: truckId → Trucks(truckId)

4. **FoodTruck.Orders** - Customer orders
   - Primary Key: `orderId` (SERIAL)
   - Fields: userId, truckId, orderStatus, totalPrice, scheduledPickupTime, estimatedEarliestPickup, createdAt
   - Foreign Keys: userId → Users(userId), truckId → Trucks(truckId)

5. **FoodTruck.OrderItems** - Individual line items within orders
   - Primary Key: `orderItemId` (SERIAL)
   - Fields: name, quantity, price, createdAt

6. **FoodTruck.Carts** - User shopping cart items
   - Primary Key: `cartId` (SERIAL)
   - Fields: userId, itemId, quantity, price
   - Foreign Keys: userId → Users(userId), itemId → MenuItems(itemId)

7. **FoodTruck.Sessions** - User authentication sessions
   - Primary Key: `id` (SERIAL)
   - Fields: userId, token, expiresAt
   - Foreign Key: userId → Users(userId)

#### Junction Tables (8):

1. **FoodTruck.User_View_Cart** (1:1 User ↔ Cart)
   - Unique constraints on both userId and cartId

2. **FoodTruck.User_Track_Order** (1:M User → Orders)
   - Tracks which orders belong to which user
   - Fields: lastViewed, notificationsEnabled

3. **FoodTruck.User_Place_Order** (1:1 User → Order placement)
   - Records the moment a user submits an order
   - Fields: placedAt, ipAddress, deviceInfo
   - Unique constraint on orderId

4. **FoodTruck.User_Manage_Trucks** (1:M User → Trucks)
   - Links truck owners to their trucks
   - Fields: assignedAt, permissions

5. **FoodTruck.User_AddRemove_MenuItems** (1:M User → MenuItems)
   - Tracks menu item management actions
   - Fields: action ('add', 'update', 'remove'), actionTimestamp, notes

6. **FoodTruck.Truck_Contains_MenuItems** (1:M Truck → MenuItems)
   - Links trucks to their menu items
   - Fields: displayOrder, addedAt, isFeatured

7. **FoodTruck.Order_Contains_MenuItems** (M:N Orders ↔ MenuItems)
   - Links orders to menu items ordered
   - Fields: quantity, priceAtOrder

8. **FoodTruck.Order_Contains_OrderItems** (1:M Order → OrderItems)
   - Links orders to their line items
   - Fields: lineNumber, createdAt

## Key Differences from Old Schema

### Column Name Changes
| Old Schema | New Schema | Table |
|------------|------------|-------|
| `id` | `userId` | Users |
| `id` | `truckId` | Trucks |
| `id` | `itemId` | MenuItems |
| `id` | `orderId` | Orders |
| `id` | `orderItemId` | OrderItems |
| `name` | `truckName` | Trucks |
| `vendor_id` | `ownerId` | Trucks |
| `food_truck_id` | `truckId` | MenuItems |
| `customer_id` | `userId` | Orders |
| `food_truck_id` | `truckId` | Orders |
| `created_at` | `createdAt` | All tables |

### Removed Fields
- All `is_active` boolean fields
- All `updated_at` timestamp fields
- `phone` from Users
- `email_verified`, `last_login` from Users
- `description`, `location`, `operating_hours`, `prep_time_minutes`, `is_busy`, `busy_until` from Trucks
- `image_url`, `prep_time_minutes`, `stock_quantity`, `calories`, `allergens` from MenuItems
- `order_number`, `subtotal`, `tax`, `notes`, `cancellation_reason`, `is_paid`, `payment_method`, `actual_completion_time`, `estimated_prep_time` from Orders

### Added Tables
- 8 junction tables to properly represent relationships
- Carts table for shopping cart functionality
- Sessions table for authentication

### Simplified Design
- Removed ENUM types (user_role, order_status, truck_status)
- Using TEXT with CHECK constraints instead
- Cleaner, more straightforward column names
- Better separation of concerns with junction tables

## Migration Path

### To Apply New Schema:
```sql
-- Run the schema file
\i database/schema.sql

-- Run seed files in order
\i database/seeds/01_seed_users.sql
\i database/seeds/02_seed_food_trucks.sql
\i database/seeds/03_seed_menu_items.sql
\i database/seeds/04_seed_orders.sql

-- Or run all at once
\i database/seeds/seed_all.sql
```

### Required Application Code Updates:
1. Update all SQL queries to use `FoodTruck.` schema prefix
2. Update column names in queries (id → userId, truckId, etc.)
3. Update table names (food_trucks → Trucks, menu_items → MenuItems)
4. Remove references to deleted columns
5. Add logic for junction table management
6. Update authentication to use Sessions table

## Alignment with Milestone 3

The refactored schema fully implements the ER diagram and table specifications from `tables.tex`, including:
- ✅ All 7 entity tables with correct columns and data types
- ✅ All 8 junction tables with proper foreign key relationships
- ✅ Correct cardinality (1:1, 1:M, M:N) implementations
- ✅ Proper constraints (PRIMARY KEY, FOREIGN KEY, CHECK, UNIQUE)
- ✅ Cascading deletes where specified
- ✅ FoodTruck schema namespace

## Next Steps

1. Update backend API routes to work with new schema
2. Update database connection configuration
3. Update ORM/query builders if used
4. Test all CRUD operations
5. Update frontend to match new API structure
6. Run integration tests
