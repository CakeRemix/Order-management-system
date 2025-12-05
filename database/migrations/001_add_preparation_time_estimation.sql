-- =====================================================
-- Migration: Add Preparation Time Estimation Fields
-- Date: 2025-12-04
-- Description: Adds auto-estimation fields to support
--              intelligent preparation time calculation
-- =====================================================

-- Set search path
SET search_path TO FoodTruck;

BEGIN;

-- =====================================================
-- Step 1: Add preparation metadata to MenuItems
-- =====================================================
ALTER TABLE FoodTruck.MenuItems 
ADD COLUMN IF NOT EXISTS preparationTimeMinutes INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS complexity TEXT DEFAULT 'medium';

-- Add constraints
ALTER TABLE FoodTruck.MenuItems 
DROP CONSTRAINT IF EXISTS preparation_time_valid,
ADD CONSTRAINT preparation_time_valid CHECK (preparationTimeMinutes >= 0 AND preparationTimeMinutes <= 120);

ALTER TABLE FoodTruck.MenuItems 
DROP CONSTRAINT IF EXISTS complexity_check,
ADD CONSTRAINT complexity_check CHECK (complexity IN ('simple', 'medium', 'complex'));

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_menu_items_complexity ON FoodTruck.MenuItems(complexity);

COMMENT ON COLUMN FoodTruck.MenuItems.preparationTimeMinutes IS 'Base preparation time in minutes for this item';
COMMENT ON COLUMN FoodTruck.MenuItems.complexity IS 'Preparation complexity: simple, medium, or complex';

-- =====================================================
-- Step 2: Add estimation fields to Orders
-- =====================================================
ALTER TABLE FoodTruck.Orders 
ADD COLUMN IF NOT EXISTS estimatedPreparationMinutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimatedCompletionTime TIMESTAMP,
ADD COLUMN IF NOT EXISTS actualCompletionTime TIMESTAMP;

-- Add constraint
ALTER TABLE FoodTruck.Orders 
DROP CONSTRAINT IF EXISTS preparation_minutes_valid,
ADD CONSTRAINT preparation_minutes_valid CHECK (estimatedPreparationMinutes >= 0);

-- Create indexes for analytics and performance
CREATE INDEX IF NOT EXISTS idx_orders_estimated_completion ON FoodTruck.Orders(estimatedCompletionTime);
CREATE INDEX IF NOT EXISTS idx_orders_actual_completion ON FoodTruck.Orders(actualCompletionTime);
CREATE INDEX IF NOT EXISTS idx_orders_preparation_analytics ON FoodTruck.Orders(truckId, actualCompletionTime) 
WHERE actualCompletionTime IS NOT NULL;

COMMENT ON COLUMN FoodTruck.Orders.estimatedPreparationMinutes IS 'Auto-calculated preparation time in minutes';
COMMENT ON COLUMN FoodTruck.Orders.estimatedCompletionTime IS 'Auto-calculated estimated completion timestamp';
COMMENT ON COLUMN FoodTruck.Orders.actualCompletionTime IS 'Actual completion time for analytics and ML feedback';

-- =====================================================
-- Step 3: Populate default values for existing menu items
-- =====================================================

-- Set default preparation times based on category
UPDATE FoodTruck.MenuItems 
SET preparationTimeMinutes = CASE
    WHEN category = 'Beverages' THEN 2
    WHEN category = 'Sides' THEN 5
    WHEN category = 'Appetizers' THEN 8
    WHEN category = 'Main Course' THEN 12
    WHEN category = 'Desserts' THEN 6
    ELSE 10
END
WHERE preparationTimeMinutes IS NULL OR preparationTimeMinutes = 10;

-- Set default complexity based on category
UPDATE FoodTruck.MenuItems 
SET complexity = CASE
    WHEN category IN ('Beverages', 'Sides') THEN 'simple'
    WHEN category IN ('Appetizers', 'Desserts') THEN 'medium'
    WHEN category = 'Main Course' THEN 'complex'
    ELSE 'medium'
END
WHERE complexity IS NULL OR complexity = 'medium';

-- =====================================================
-- Step 4: Create view for estimation analytics
-- =====================================================
CREATE OR REPLACE VIEW FoodTruck.EstimationAccuracyView AS
SELECT 
    o.truckid,
    t.truckname,
    COUNT(*) as total_orders,
    AVG(EXTRACT(EPOCH FROM (o.actualcompletiontime - o.createdat)) / 60) as avg_actual_minutes,
    AVG(o.estimatedpreparationminutes) as avg_estimated_minutes,
    AVG(ABS(
        EXTRACT(EPOCH FROM (o.actualcompletiontime - o.createdat)) / 60 - 
        o.estimatedpreparationminutes
    )) as avg_variance_minutes,
    COUNT(*) FILTER (
        WHERE ABS(
            EXTRACT(EPOCH FROM (o.actualcompletiontime - o.createdat)) / 60 - 
            o.estimatedpreparationminutes
        ) <= 5
    ) * 100.0 / COUNT(*) as accuracy_percentage
FROM FoodTruck.Orders o
JOIN FoodTruck.Trucks t ON o.truckid = t.truckid
WHERE o.actualcompletiontime IS NOT NULL 
  AND o.estimatedpreparationminutes IS NOT NULL
  AND o.createdat >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY o.truckid, t.truckname;

COMMENT ON VIEW FoodTruck.EstimationAccuracyView IS 'Analytics view for preparation time estimation accuracy';

-- =====================================================
-- Step 5: Grant necessary permissions
-- =====================================================
GRANT SELECT ON FoodTruck.EstimationAccuracyView TO PUBLIC;

COMMIT;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify menu items have preparation data
SELECT 
    category,
    AVG(preparationtimeminutes) as avg_prep_time,
    COUNT(*) as item_count,
    STRING_AGG(DISTINCT complexity, ', ') as complexities
FROM FoodTruck.MenuItems
GROUP BY category;

-- Verify orders table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'foodtruck' 
  AND table_name = 'orders'
  AND column_name IN ('estimatedpreparationminutes', 'estimatedcompletiontime', 'actualcompletiontime')
ORDER BY ordinal_position;

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================
/*
BEGIN;

-- Drop view
DROP VIEW IF EXISTS FoodTruck.EstimationAccuracyView;

-- Remove indexes
DROP INDEX IF EXISTS FoodTruck.idx_menu_items_complexity;
DROP INDEX IF EXISTS FoodTruck.idx_orders_estimated_completion;
DROP INDEX IF EXISTS FoodTruck.idx_orders_actual_completion;
DROP INDEX IF EXISTS FoodTruck.idx_orders_preparation_analytics;

-- Remove columns from Orders
ALTER TABLE FoodTruck.Orders 
DROP COLUMN IF EXISTS estimatedPreparationMinutes,
DROP COLUMN IF EXISTS estimatedCompletionTime,
DROP COLUMN IF EXISTS actualCompletionTime;

-- Remove columns from MenuItems
ALTER TABLE FoodTruck.MenuItems 
DROP COLUMN IF EXISTS preparationTimeMinutes,
DROP COLUMN IF EXISTS complexity;

COMMIT;
*/
