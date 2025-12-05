-- =====================================================
-- GIU Food Truck Management System
-- PostgreSQL Database Schema
-- Milestone 3 - Winter 2025
-- Schema: FoodTruck
-- =====================================================

-- Drop existing schema and recreate
DROP SCHEMA IF EXISTS FoodTruck CASCADE;
CREATE SCHEMA FoodTruck;

-- Set search path to FoodTruck schema
SET search_path TO FoodTruck;

-- =====================================================
-- TABLE: Users
-- Stores information about system users (customers and truck owners)
-- =====================================================
CREATE TABLE FoodTruck.Users (
    userId SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    birthDate DATE DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT role_check CHECK (role IN ('customer', 'truckOwner', 'admin'))
);

CREATE INDEX idx_users_email ON FoodTruck.Users(email);
CREATE INDEX idx_users_role ON FoodTruck.Users(role);

-- =====================================================
-- TABLE: Trucks
-- Stores information about food trucks
-- =====================================================
CREATE TABLE FoodTruck.Trucks (
    truckId SERIAL PRIMARY KEY,
    truckName TEXT NOT NULL UNIQUE,
    truckLogo TEXT,
    ownerId INTEGER NOT NULL REFERENCES FoodTruck.Users(userId) ON DELETE CASCADE,
    truckStatus TEXT DEFAULT 'available',
    orderStatus TEXT DEFAULT 'available',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT truck_status_check CHECK (truckStatus IN ('available', 'unavailable')),
    CONSTRAINT order_status_check CHECK (orderStatus IN ('available', 'unavailable'))
);

CREATE INDEX idx_trucks_owner ON FoodTruck.Trucks(ownerId);
CREATE INDEX idx_trucks_status ON FoodTruck.Trucks(truckStatus);

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
    category TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    preparationTimeMinutes INTEGER DEFAULT 10,
    complexity TEXT DEFAULT 'medium',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT price_positive CHECK (price >= 0),
    CONSTRAINT status_check CHECK (status IN ('available', 'unavailable')),
    CONSTRAINT complexity_check CHECK (complexity IN ('simple', 'medium', 'complex'))
);

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
    orderStatus TEXT NOT NULL,
    totalPrice NUMERIC(10,2) NOT NULL,
    scheduledPickupTime TIMESTAMP,
    estimatedEarliestPickup TIMESTAMP,
    estimatedPreparationMinutes INTEGER DEFAULT 0,
    estimatedCompletionTime TIMESTAMP,
    actualCompletionTime TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT total_price_positive CHECK (totalPrice >= 0),
    CONSTRAINT order_status_check CHECK (orderStatus IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled'))
);

CREATE INDEX idx_orders_user ON FoodTruck.Orders(userId);
CREATE INDEX idx_orders_truck ON FoodTruck.Orders(truckId);
CREATE INDEX idx_orders_status ON FoodTruck.Orders(orderStatus);

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
    
    CONSTRAINT cart_quantity_positive CHECK (quantity > 0),
    CONSTRAINT cart_price_non_negative CHECK (price >= 0)
);

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

CREATE INDEX idx_sessions_user ON FoodTruck.Sessions(userId);
CREATE INDEX idx_sessions_token ON FoodTruck.Sessions(token);

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

CREATE INDEX idx_order_contains_orderitems_order ON FoodTruck.Order_Contains_OrderItems(orderId);
CREATE INDEX idx_order_contains_orderitems_item ON FoodTruck.Order_Contains_OrderItems(orderItemId);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
