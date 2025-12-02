-- =====================================================
-- Seed Data: Food Trucks (Public Schema) - Complete
-- =====================================================

-- Clear existing data
TRUNCATE TABLE public.food_trucks CASCADE;
ALTER SEQUENCE public.food_trucks_id_seq RESTART WITH 1;

-- Insert Food Trucks with ALL fields
INSERT INTO public.food_trucks (
    name, 
    description,
    location,
    image_url,
    vendor_id,
    status,
    is_busy,
    busy_until,
    operating_hours,
    prep_time_minutes,
    is_active
) VALUES
-- Demeshq - Syrian Cuisine
(
    'Demeshq',
    'Authentic Syrian cuisine with traditional flavors. We specialize in shawarma, falafel, and mezze. Our recipes have been passed down through generations, bringing you the true taste of Damascus.',
    'Main Campus Plaza, Building A',
    '/images/trucks/demeshq-logo.png',
    NULL, -- vendor_id can be linked to a user later
    'open',
    false,
    NULL,
    '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "15:00"}, "saturday": "closed", "sunday": "closed"}'::jsonb,
    15,
    true
),
-- Container - Healthy Options
(
    'Container',
    'Fresh and healthy meal options in eco-friendly packaging. Perfect for students who care about nutrition and the environment. All ingredients are locally sourced and organic when possible.',
    'Engineering Building, Gate 2',
    '/images/trucks/container-logo.png',
    NULL,
    'open',
    false,
    NULL,
    '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "14:00"}, "saturday": "closed", "sunday": "closed"}'::jsonb,
    20,
    true
),
-- Essens - Sandwiches & Wraps
(
    'Essens',
    'Premium sandwiches and wraps made fresh daily. Choose from our signature recipes or build your own. We use artisan bread and the finest quality ingredients.',
    'Library Courtyard, Ground Floor',
    '/images/trucks/essens-logo.png',
    NULL,
    'open',
    false,
    NULL,
    '{"monday": {"open": "08:30", "close": "19:00"}, "tuesday": {"open": "08:30", "close": "19:00"}, "wednesday": {"open": "08:30", "close": "19:00"}, "thursday": {"open": "08:30", "close": "19:00"}, "friday": {"open": "08:30", "close": "16:00"}, "saturday": {"open": "10:00", "close": "15:00"}, "sunday": "closed"}'::jsonb,
    12,
    true
),
-- Ftar w Asha - Egyptian Comfort Food
(
    'Ftar w Asha',
    'Egyptian comfort food for breakfast and dinner. Traditional homemade recipes from Ful Medames to Koshari. Taste the authentic flavors of Egyptian street food.',
    'Student Center, Main Entrance',
    '/images/trucks/ftarwasha-logo.png',
    NULL,
    'open',
    false,
    NULL,
    '{"monday": {"open": "07:00", "close": "20:00"}, "tuesday": {"open": "07:00", "close": "20:00"}, "wednesday": {"open": "07:00", "close": "20:00"}, "thursday": {"open": "07:00", "close": "20:00"}, "friday": {"open": "07:00", "close": "15:00"}, "saturday": {"open": "08:00", "close": "14:00"}, "sunday": "closed"}'::jsonb,
    18,
    true
),
-- Loaded - Fast Food & Burgers
(
    'Loaded',
    'Loaded fries, juicy burgers, and indulgent fast food. Everything is bigger, better, and loaded with flavor. Perfect for when you need serious comfort food.',
    'Sports Complex, Near Football Field',
    '/images/trucks/loaded-logo.png',
    NULL,
    'open',
    false,
    NULL,
    '{"monday": {"open": "11:00", "close": "21:00"}, "tuesday": {"open": "11:00", "close": "21:00"}, "wednesday": {"open": "11:00", "close": "21:00"}, "thursday": {"open": "11:00", "close": "21:00"}, "friday": {"open": "11:00", "close": "22:00"}, "saturday": {"open": "12:00", "close": "22:00"}, "sunday": {"open": "13:00", "close": "20:00"}}'::jsonb,
    15,
    true
);

-- Display seed results
SELECT 
    id,
    name,
    description,
    location,
    status,
    is_busy,
    prep_time_minutes,
    is_active,
    operating_hours->>'monday' as monday_hours
FROM public.food_trucks
ORDER BY id;

SELECT 'Food trucks seeded successfully with all fields!' as status;
SELECT COUNT(*) as total_trucks FROM public.food_trucks;
