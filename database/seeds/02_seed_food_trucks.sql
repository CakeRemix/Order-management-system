-- =====================================================
-- Seed Data: Food Trucks
-- =====================================================

-- Clear existing data
TRUNCATE TABLE food_trucks CASCADE;
RESET SEQUENCE food_trucks_id_seq;

-- Insert Food Trucks
INSERT INTO food_trucks (
    name, 
    description, 
    location, 
    vendor_id, 
    status, 
    is_busy,
    prep_time_minutes,
    operating_hours,
    is_active
) VALUES
(
    'Demeshq',
    'Authentic Syrian cuisine with traditional flavors. Famous for shawarma, falafel, and fresh mezze.',
    'Near Building A - Main Campus',
    (SELECT id FROM users WHERE email = 'demeshq.vendor@giu-uni.de'),
    'open',
    FALSE,
    15,
    '{
        "saturday": {"open": "08:00", "close": "16:40"},
        "sunday": {"open": "08:00", "close": "16:40"},
        "monday": {"open": "08:00", "close": "16:40"},
        "tuesday": {"open": "08:00", "close": "16:40"},
        "wednesday": {"open": "08:00", "close": "16:40"},
        "thursday": {"open": "08:00", "close": "16:40"}
    }'::jsonb,
    TRUE
),
(
    'Container',
    'Modern fusion cuisine in a trendy container setup. Specializing in gourmet burgers, wraps, and fresh salads.',
    'Campus Center - Food Court Area',
    (SELECT id FROM users WHERE email = 'container.vendor@giu-uni.de'),
    'busy',
    TRUE,
    20,
    '{
        "saturday": {"open": "08:00", "close": "16:40"},
        "sunday": {"open": "08:00", "close": "16:40"},
        "monday": {"open": "08:00", "close": "16:40"},
        "tuesday": {"open": "08:00", "close": "16:40"},
        "wednesday": {"open": "08:00", "close": "16:40"},
        "thursday": {"open": "08:00", "close": "16:40"}
    }'::jsonb,
    TRUE
),
(
    'Essens',
    'Healthy and nutritious meals for conscious eaters. Offering protein bowls, smoothies, and organic options.',
    'Near Library - East Wing',
    (SELECT id FROM users WHERE email = 'essens.vendor@giu-uni.de'),
    'closed',
    FALSE,
    12,
    '{
        "saturday": {"open": "08:00", "close": "16:40"},
        "sunday": {"open": "08:00", "close": "16:40"},
        "monday": {"open": "08:00", "close": "16:40"},
        "tuesday": {"open": "08:00", "close": "16:40"},
        "wednesday": {"open": "08:00", "close": "16:40"},
        "thursday": {"open": "08:00", "close": "16:40"}
    }'::jsonb,
    TRUE
),
(
    'Ftar w Asha',
    'Traditional Egyptian breakfast and lunch. Home-cooked taste with comfort food favorites.',
    'Engineering Building - Courtyard',
    (SELECT id FROM users WHERE email = 'ftarwasha.vendor@giu-uni.de'),
    'open',
    FALSE,
    18,
    '{
        "saturday": {"open": "08:00", "close": "16:40"},
        "sunday": {"open": "08:00", "close": "16:40"},
        "monday": {"open": "08:00", "close": "16:40"},
        "tuesday": {"open": "08:00", "close": "16:40"},
        "wednesday": {"open": "08:00", "close": "16:40"},
        "thursday": {"open": "08:00", "close": "16:40"}
    }'::jsonb,
    TRUE
),
(
    'Loaded',
    'Loaded fries and indulgent comfort food. Creative toppings and bold flavors for the adventurous.',
    'Sports Complex - Parking Area',
    (SELECT id FROM users WHERE email = 'loaded.vendor@giu-uni.de'),
    'busy',
    TRUE,
    25,
    '{
        "saturday": {"open": "08:00", "close": "16:40"},
        "sunday": {"open": "08:00", "close": "16:40"},
        "monday": {"open": "08:00", "close": "16:40"},
        "tuesday": {"open": "08:00", "close": "16:40"},
        "wednesday": {"open": "08:00", "close": "16:40"},
        "thursday": {"open": "08:00", "close": "16:40"}
    }'::jsonb,
    TRUE
);

-- Display seed results
SELECT 
    id,
    name,
    status,
    is_busy,
    prep_time_minutes,
    location
FROM food_trucks
ORDER BY id;

SELECT 'Food trucks seeded successfully!' as status;
