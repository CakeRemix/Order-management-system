-- =====================================================
-- GIU Food Truck Order Management System
-- PostgreSQL Database Schema
-- Team: Sleepers
-- Date: 2025-11-13
-- =====================================================

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS food_trucks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS truck_status CASCADE;

-- =====================================================
-- ENUMS
-- =====================================================

-- User role types: customer, vendor, admin
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');

-- Order status types: received, preparing, ready, completed, cancelled
CREATE TYPE order_status AS ENUM ('received', 'preparing', 'ready', 'completed', 'cancelled');

-- Food truck status: open, busy, closed
CREATE TYPE truck_status AS ENUM ('open', 'busy', 'closed');

-- =====================================================
-- TABLE: users
-- Stores all system users (customers, vendors, admins)
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    role user_role NOT NULL DEFAULT 'customer',
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT name_not_empty CHECK (TRIM(name) != '')
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =====================================================
-- TABLE: food_trucks
-- Stores food truck information
-- =====================================================
CREATE TABLE food_trucks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    location VARCHAR(255),
    image_url VARCHAR(500),
    vendor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status truck_status NOT NULL DEFAULT 'closed',
    is_busy BOOLEAN NOT NULL DEFAULT FALSE,
    busy_until TIMESTAMP WITH TIME ZONE,
    operating_hours JSONB, -- Store opening/closing hours per day
    prep_time_minutes INTEGER NOT NULL DEFAULT 15, -- Average preparation time
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT name_not_empty CHECK (TRIM(name) != ''),
    CONSTRAINT prep_time_positive CHECK (prep_time_minutes > 0)
);

-- Indexes for food_trucks table
CREATE INDEX idx_trucks_vendor ON food_trucks(vendor_id);
CREATE INDEX idx_trucks_status ON food_trucks(status);
CREATE INDEX idx_trucks_active ON food_trucks(is_active);
CREATE INDEX idx_trucks_name ON food_trucks(name);

-- =====================================================
-- TABLE: menu_items
-- Stores menu items for each food truck
-- =====================================================
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    food_truck_id INTEGER NOT NULL REFERENCES food_trucks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100), -- e.g., 'Sandwiches', 'Drinks', 'Desserts'
    prep_time_minutes INTEGER NOT NULL DEFAULT 5,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INTEGER, -- NULL means unlimited
    calories INTEGER,
    allergens TEXT[], -- Array of allergens
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT price_positive CHECK (price >= 0),
    CONSTRAINT prep_time_positive CHECK (prep_time_minutes >= 0),
    CONSTRAINT stock_non_negative CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
    CONSTRAINT name_not_empty CHECK (TRIM(name) != '')
);

-- Indexes for menu_items table
CREATE INDEX idx_items_truck ON menu_items(food_truck_id);
CREATE INDEX idx_items_available ON menu_items(is_available);
CREATE INDEX idx_items_active ON menu_items(is_active);
CREATE INDEX idx_items_category ON menu_items(category);
CREATE INDEX idx_items_price ON menu_items(price);

-- =====================================================
-- TABLE: orders
-- Stores customer orders
-- =====================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_truck_id INTEGER NOT NULL REFERENCES food_trucks(id) ON DELETE CASCADE,
    order_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable order number
    status order_status NOT NULL DEFAULT 'received',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_prep_time INTEGER, -- In minutes
    actual_completion_time TIMESTAMP WITH TIME ZONE,
    notes TEXT, -- Special instructions from customer
    cancellation_reason TEXT,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method VARCHAR(50), -- 'cash', 'card', 'university_account'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT total_positive CHECK (total >= 0),
    CONSTRAINT subtotal_positive CHECK (subtotal >= 0),
    CONSTRAINT tax_non_negative CHECK (tax >= 0),
    CONSTRAINT pickup_after_creation CHECK (pickup_time >= created_at)
);

-- Indexes for orders table
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_truck ON orders(food_truck_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_time ON orders(pickup_time);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- =====================================================
-- TABLE: order_items
-- Stores individual items in each order
-- =====================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    item_name VARCHAR(255) NOT NULL, -- Snapshot of item name at order time
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL, -- Price at time of order
    subtotal NUMERIC(10, 2) NOT NULL, -- quantity * unit_price
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT unit_price_non_negative CHECK (unit_price >= 0),
    CONSTRAINT subtotal_correct CHECK (subtotal = quantity * unit_price)
);

-- Indexes for order_items table
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item ON order_items(menu_item_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_trucks_updated_at
    BEFORE UPDATE ON food_trucks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || LPAD(NEW.id::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Active orders with customer and truck details
CREATE OR REPLACE VIEW active_orders_view AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total,
    o.pickup_time,
    o.created_at,
    c.id AS customer_id,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    ft.id AS truck_id,
    ft.name AS truck_name,
    ft.location AS truck_location,
    COUNT(oi.id) AS item_count
FROM orders o
JOIN users c ON o.customer_id = c.id
JOIN food_trucks ft ON o.food_truck_id = ft.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status NOT IN ('completed', 'cancelled')
GROUP BY o.id, c.id, ft.id
ORDER BY o.pickup_time;

-- View: Menu items with truck details
CREATE OR REPLACE VIEW menu_items_with_truck AS
SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.category,
    mi.prep_time_minutes,
    mi.is_available,
    mi.stock_quantity,
    ft.id AS truck_id,
    ft.name AS truck_name,
    ft.status AS truck_status
FROM menu_items mi
JOIN food_trucks ft ON mi.food_truck_id = ft.id
WHERE mi.is_active = TRUE AND ft.is_active = TRUE;

-- View: Vendor dashboard statistics
CREATE OR REPLACE VIEW vendor_stats AS
SELECT 
    ft.id AS truck_id,
    ft.name AS truck_name,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'received' THEN o.id END) AS pending_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'preparing' THEN o.id END) AS preparing_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'ready' THEN o.id END) AS ready_orders,
    COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') THEN o.total END), 0) AS total_revenue,
    COUNT(DISTINCT mi.id) AS menu_item_count,
    AVG(EXTRACT(EPOCH FROM (o.actual_completion_time - o.created_at)) / 60) AS avg_prep_time_minutes
FROM food_trucks ft
LEFT JOIN orders o ON ft.id = o.food_truck_id
LEFT JOIN menu_items mi ON ft.id = mi.food_truck_id AND mi.is_active = TRUE
GROUP BY ft.id, ft.name;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Calculate order total from order items
CREATE OR REPLACE FUNCTION calculate_order_total(order_id_param INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    calculated_total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(subtotal), 0)
    INTO calculated_total
    FROM order_items
    WHERE order_id = order_id_param;
    
    RETURN calculated_total;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if food truck can accept orders
CREATE OR REPLACE FUNCTION can_truck_accept_orders(truck_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    truck_record RECORD;
    current_time TIME;
BEGIN
    SELECT status, is_busy, busy_until
    INTO truck_record
    FROM food_trucks
    WHERE id = truck_id_param AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if truck is busy
    IF truck_record.is_busy AND (truck_record.busy_until IS NULL OR truck_record.busy_until > CURRENT_TIMESTAMP) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if truck status is open
    IF truck_record.status != 'open' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Get estimated pickup time
CREATE OR REPLACE FUNCTION get_estimated_pickup_time(truck_id_param INTEGER)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    base_prep_time INTEGER;
    pending_orders_count INTEGER;
    additional_minutes INTEGER;
BEGIN
    -- Get truck's base preparation time
    SELECT prep_time_minutes INTO base_prep_time
    FROM food_trucks
    WHERE id = truck_id_param;
    
    -- Count pending orders
    SELECT COUNT(*) INTO pending_orders_count
    FROM orders
    WHERE food_truck_id = truck_id_param 
    AND status IN ('received', 'preparing')
    AND pickup_time > CURRENT_TIMESTAMP;
    
    -- Add 5 minutes per pending order
    additional_minutes := pending_orders_count * 5;
    
    RETURN CURRENT_TIMESTAMP + INTERVAL '1 minute' * (base_prep_time + additional_minutes);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Create roles (optional - uncomment if needed)
-- CREATE ROLE app_user WITH LOGIN PASSWORD 'your_password_here';
-- GRANT CONNECT ON DATABASE your_database TO app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Stores all system users including customers, vendors, and administrators';
COMMENT ON TABLE food_trucks IS 'Stores food truck information and operational details';
COMMENT ON TABLE menu_items IS 'Stores menu items for each food truck';
COMMENT ON TABLE orders IS 'Stores customer orders with status tracking';
COMMENT ON TABLE order_items IS 'Stores individual items within each order';

COMMENT ON COLUMN users.password IS 'Password stored as bcrypt hash';
COMMENT ON COLUMN food_trucks.operating_hours IS 'JSON format: {"monday": {"open": "08:00", "close": "16:40"}, ...}';
COMMENT ON COLUMN orders.order_number IS 'Human-readable unique order identifier';
COMMENT ON COLUMN order_items.unit_price IS 'Price snapshot at time of order to preserve historical pricing';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
