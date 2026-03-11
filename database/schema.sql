-- =====================================================
-- GIU Food Truck Management System
-- PostgreSQL Database Schema
-- Based on tables.tex specification
-- Team: Sleepers
-- Date: 2025-12-01
-- Schema: FoodTruck
-- =====================================================

-- Drop existing schema and recreate
DROP SCHEMA IF EXISTS FoodTruck CASCADE;
CREATE SCHEMA FoodTruck;

-- Set search path to FoodTruck schema
SET search_path TO FoodTruck;

-- =====================================================
-- ENTITY TABLES (7 Total)
-- =====================================================

-- =====================================================
-- TABLE: Users
-- Stores information about system users (customers and truck owners)
-- =====================================================
CREATE TABLE FoodTruck.Users (
    userId SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer', -- 'customer', 'truckOwner', or 'admin'
    birthDate DATE DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT role_check CHECK (role IN ('customer', 'truckOwner', 'admin'))
);

-- Indexes for Users table
CREATE INDEX idx_users_email ON FoodTruck.Users(email);
CREATE INDEX idx_users_role ON FoodTruck.Users(role);
CREATE INDEX idx_users_created_at ON FoodTruck.Users(createdAt);

-- =====================================================
-- TABLE: Trucks
-- Stores information about food trucks
-- =====================================================
CREATE TABLE FoodTruck.Trucks (
    truckId SERIAL PRIMARY KEY,
    truckName TEXT NOT NULL UNIQUE,
    truckLogo TEXT,
    ownerId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    truckStatus TEXT DEFAULT 'available', -- 'available', 'unavailable'
    orderStatus TEXT DEFAULT 'available', -- 'available', 'unavailable'
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT truck_status_check CHECK (truckStatus IN ('available', 'unavailable')),
    CONSTRAINT order_status_check CHECK (orderStatus IN ('available', 'unavailable'))
);

-- Indexes for Trucks table
CREATE INDEX idx_trucks_owner ON FoodTruck.Trucks(ownerId);
CREATE INDEX idx_trucks_status ON FoodTruck.Trucks(truckStatus);
CREATE INDEX idx_trucks_name ON FoodTruck.Trucks(truckName);

-- =====================================================
-- TABLE: MenuItems
-- Stores menu items for each food truck
-- =====================================================
CREATE TABLE FoodTruck.MenuItems (
    itemId SERIAL PRIMARY KEY,
    truckId INTEGER NOT NULL REFERENCES FoodTruck.Trucks(truckId) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL, -- 'Main Course', 'Sides', 'Beverages', etc.
    status TEXT DEFAULT 'available', -- 'available', 'unavailable'
    imageUrl TEXT, -- Path to menu item image
    preparationTimeMinutes INTEGER DEFAULT 10, -- Base preparation time in minutes
    complexity TEXT DEFAULT 'medium', -- 'simple', 'medium', 'complex'
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT price_positive CHECK (price >= 0),
    CONSTRAINT status_check CHECK (status IN ('available', 'unavailable')),
    CONSTRAINT preparation_time_valid CHECK (preparationTimeMinutes >= 0 AND preparationTimeMinutes <= 120),
    CONSTRAINT complexity_check CHECK (complexity IN ('simple', 'medium', 'complex'))
);

-- Indexes for MenuItems table
CREATE INDEX idx_menu_items_truck ON FoodTruck.MenuItems(truckId);
CREATE INDEX idx_menu_items_status ON FoodTruck.MenuItems(status);
CREATE INDEX idx_menu_items_category ON FoodTruck.MenuItems(category);

-- =====================================================
-- TABLE: Orders
-- Stores customer orders
-- =====================================================
CREATE TABLE FoodTruck.Orders (
    orderId SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    truckId INTEGER NOT NULL REFERENCES FoodTruck.Trucks(truckId) ON DELETE CASCADE,
    orderStatus TEXT NOT NULL, -- 'pending', 'confirmed', 'ready', 'completed', 'cancelled'
    totalPrice NUMERIC(10,2) NOT NULL,
    scheduledPickupTime TIMESTAMP,
    estimatedEarliestPickup TIMESTAMP,
    estimatedPreparationMinutes INTEGER DEFAULT 0, -- Auto-calculated preparation time
    estimatedCompletionTime TIMESTAMP, -- Auto-calculated completion timestamp
    actualCompletionTime TIMESTAMP, -- Actual completion for analytics
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT total_price_positive CHECK (totalPrice >= 0),
    CONSTRAINT order_status_check CHECK (orderStatus IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
    CONSTRAINT preparation_minutes_valid CHECK (estimatedPreparationMinutes >= 0)
);

-- Indexes for Orders table
CREATE INDEX idx_orders_user ON FoodTruck.Orders(userId);
CREATE INDEX idx_orders_truck ON FoodTruck.Orders(truckId);
CREATE INDEX idx_orders_status ON FoodTruck.Orders(orderStatus);
CREATE INDEX idx_orders_created_at ON FoodTruck.Orders(createdAt DESC);

-- =====================================================
-- TABLE: OrderItems
-- Stores individual line items within an order
-- =====================================================
CREATE TABLE FoodTruck.OrderItems (
    orderItemId SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT price_non_negative CHECK (price >= 0)
);

-- =====================================================
-- TABLE: Carts
-- Represents items in a user's shopping cart
-- =====================================================
CREATE TABLE FoodTruck.Carts (
    cartId SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    itemId INTEGER NOT NULL REFERENCES FoodTruck.MenuItems(itemId) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    
    -- Constraints
    CONSTRAINT cart_quantity_positive CHECK (quantity > 0),
    CONSTRAINT cart_price_non_negative CHECK (price >= 0)
);

-- Indexes for Carts table
CREATE INDEX idx_carts_user ON FoodTruck.Carts(userId);
CREATE INDEX idx_carts_item ON FoodTruck.Carts(itemId);

-- =====================================================
-- TABLE: Sessions
-- Stores user authentication sessions
-- =====================================================
CREATE TABLE FoodTruck.Sessions (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expiresAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Sessions table
CREATE INDEX idx_sessions_user ON FoodTruck.Sessions(userId);
CREATE INDEX idx_sessions_token ON FoodTruck.Sessions(token);

-- =====================================================
-- JUNCTION TABLES (8 Total)
-- =====================================================

-- =====================================================
-- TABLE: User_View_Cart
-- Junction table: 1:1 relationship between User and Cart
-- =====================================================
CREATE TABLE FoodTruck.User_View_Cart (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL UNIQUE REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    cartId INTEGER NOT NULL UNIQUE REFERENCES FoodTruck.Carts(cartId) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for User_View_Cart table
CREATE INDEX idx_user_view_cart_user ON FoodTruck.User_View_Cart(userId);
CREATE INDEX idx_user_view_cart_cart ON FoodTruck.User_View_Cart(cartId);

-- =====================================================
-- TABLE: User_Track_Order
-- Junction table: 1:M relationship between User and Orders
-- =====================================================
CREATE TABLE FoodTruck.User_Track_Order (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    orderId INTEGER NOT NULL REFERENCES FoodTruck.Orders(orderId) ON DELETE CASCADE,
    lastViewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notificationsEnabled BOOLEAN DEFAULT TRUE
);

-- Indexes for User_Track_Order table
CREATE INDEX idx_user_track_order_user ON FoodTruck.User_Track_Order(userId);
CREATE INDEX idx_user_track_order_order ON FoodTruck.User_Track_Order(orderId);

-- =====================================================
-- TABLE: User_Place_Order
-- Junction table: 1:1 relationship for order placement action
-- =====================================================
CREATE TABLE FoodTruck.User_Place_Order (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    orderId INTEGER NOT NULL UNIQUE REFERENCES FoodTruck.Orders(orderId) ON DELETE CASCADE,
    placedAt TIMESTAMP NOT NULL,
    ipAddress TEXT,
    deviceInfo TEXT
);

-- Indexes for User_Place_Order table
CREATE INDEX idx_user_place_order_user ON FoodTruck.User_Place_Order(userId);
CREATE INDEX idx_user_place_order_order ON FoodTruck.User_Place_Order(orderId);

-- =====================================================
-- TABLE: User_Manage_Trucks
-- Junction table: 1:M relationship between truck owners and trucks
-- =====================================================
CREATE TABLE FoodTruck.User_Manage_Trucks (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    truckId INTEGER NOT NULL REFERENCES FoodTruck.Trucks(truckId) ON DELETE CASCADE,
    assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    permissions TEXT DEFAULT 'full'
);

-- Indexes for User_Manage_Trucks table
CREATE INDEX idx_user_manage_trucks_user ON FoodTruck.User_Manage_Trucks(userId);
CREATE INDEX idx_user_manage_trucks_truck ON FoodTruck.User_Manage_Trucks(truckId);

-- =====================================================
-- TABLE: User_AddRemove_MenuItems
-- Junction table: 1:M relationship for menu item management
-- =====================================================
CREATE TABLE FoodTruck.User_AddRemove_MenuItems (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    itemId INTEGER NOT NULL REFERENCES FoodTruck.MenuItems(itemId) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'add', 'update', 'remove'
    actionTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Constraints
    CONSTRAINT action_check CHECK (action IN ('add', 'update', 'remove'))
);

-- Indexes for User_AddRemove_MenuItems table
CREATE INDEX idx_user_addremove_menu_user ON FoodTruck.User_AddRemove_MenuItems(userId);
CREATE INDEX idx_user_addremove_menu_item ON FoodTruck.User_AddRemove_MenuItems(itemId);

-- =====================================================
-- TABLE: Truck_Contains_MenuItems
-- Junction table: 1:M relationship between trucks and menu items
-- =====================================================
CREATE TABLE FoodTruck.Truck_Contains_MenuItems (
    id SERIAL PRIMARY KEY,
    truckId INTEGER NOT NULL REFERENCES FoodTruck.Trucks(truckId) ON DELETE CASCADE,
    itemId INTEGER NOT NULL REFERENCES FoodTruck.MenuItems(itemId) ON DELETE CASCADE,
    displayOrder INTEGER DEFAULT 0,
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isFeatured BOOLEAN DEFAULT FALSE
);

-- Indexes for Truck_Contains_MenuItems table
CREATE INDEX idx_truck_contains_menu_truck ON FoodTruck.Truck_Contains_MenuItems(truckId);
CREATE INDEX idx_truck_contains_menu_item ON FoodTruck.Truck_Contains_MenuItems(itemId);

-- =====================================================
-- TABLE: Order_Contains_MenuItems
-- Junction table: M:N relationship between orders and menu items
-- =====================================================
CREATE TABLE FoodTruck.Order_Contains_MenuItems (
    id SERIAL PRIMARY KEY,
    orderId INTEGER NOT NULL REFERENCES FoodTruck.Orders(orderId) ON DELETE CASCADE,
    itemId INTEGER NOT NULL REFERENCES FoodTruck.MenuItems(itemId) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    priceAtOrder NUMERIC(10,2) NOT NULL,
    
    -- Constraints
    CONSTRAINT ocm_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ocm_price_non_negative CHECK (priceAtOrder >= 0)
);

-- Indexes for Order_Contains_MenuItems table
CREATE INDEX idx_order_contains_menu_order ON FoodTruck.Order_Contains_MenuItems(orderId);
CREATE INDEX idx_order_contains_menu_item ON FoodTruck.Order_Contains_MenuItems(itemId);

-- =====================================================
-- TABLE: Order_Contains_OrderItems
-- Junction table: 1:M relationship between orders and order items
-- =====================================================
CREATE TABLE FoodTruck.Order_Contains_OrderItems (
    id SERIAL PRIMARY KEY,
    orderId INTEGER NOT NULL REFERENCES FoodTruck.Orders(orderId) ON DELETE CASCADE,
    orderItemId INTEGER NOT NULL REFERENCES FoodTruck.OrderItems(orderItemId) ON DELETE CASCADE,
    lineNumber INTEGER,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Order_Contains_OrderItems table
CREATE INDEX idx_order_contains_orderitems_order ON FoodTruck.Order_Contains_OrderItems(orderId);
CREATE INDEX idx_order_contains_orderitems_item ON FoodTruck.Order_Contains_OrderItems(orderItemId);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON SCHEMA FoodTruck IS 'GIU Food Truck Management System - Complete database schema';

COMMENT ON TABLE FoodTruck.Users IS 'Stores information about system users (customers and truck owners)';
COMMENT ON TABLE FoodTruck.Trucks IS 'Stores information about food trucks';
COMMENT ON TABLE FoodTruck.MenuItems IS 'Stores menu items for each food truck';
COMMENT ON TABLE FoodTruck.Orders IS 'Stores customer orders';
COMMENT ON TABLE FoodTruck.OrderItems IS 'Stores individual line items within an order';
COMMENT ON TABLE FoodTruck.Carts IS 'Represents items in a user shopping cart';
COMMENT ON TABLE FoodTruck.Sessions IS 'Stores user authentication sessions';

COMMENT ON TABLE FoodTruck.User_View_Cart IS 'Junction table: 1:1 relationship between User and Cart';
COMMENT ON TABLE FoodTruck.User_Track_Order IS 'Junction table: 1:M relationship for order tracking';
COMMENT ON TABLE FoodTruck.User_Place_Order IS 'Junction table: 1:1 relationship for order placement';
COMMENT ON TABLE FoodTruck.User_Manage_Trucks IS 'Junction table: 1:M relationship for truck management';
COMMENT ON TABLE FoodTruck.User_AddRemove_MenuItems IS 'Junction table: 1:M relationship for menu management';
COMMENT ON TABLE FoodTruck.Truck_Contains_MenuItems IS 'Junction table: 1:M relationship between trucks and menu items';
COMMENT ON TABLE FoodTruck.Order_Contains_MenuItems IS 'Junction table: M:N relationship between orders and menu items';
COMMENT ON TABLE FoodTruck.Order_Contains_OrderItems IS 'Junction table: 1:M relationship between orders and order items';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
