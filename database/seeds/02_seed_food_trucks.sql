-- =====================================================
-- Seed Data: Food Trucks
-- Schema: FoodTruck
-- =====================================================

-- Clear existing data
TRUNCATE TABLE FoodTruck.Trucks CASCADE;
ALTER SEQUENCE FoodTruck.Trucks_truckid_seq RESTART WITH 1;

-- Insert Food Trucks
INSERT INTO FoodTruck.Trucks (
    truckName, 
    truckLogo,
    ownerId, 
    truckStatus, 
    orderStatus
) VALUES
(
    'Demeshq',
    '/images/trucks/demeshq-logo.png',
    (SELECT userId FROM FoodTruck.Users WHERE email = 'demeshq.vendor@giu-uni.de'),
    'available',
    'available'
),
(
    'Container',
    '/images/trucks/container-logo.png',
    (SELECT userId FROM FoodTruck.Users WHERE email = 'container.vendor@giu-uni.de'),
    'available',
    'available'
),
(
    'Essens',
    '/images/trucks/essens-logo.png',
    (SELECT userId FROM FoodTruck.Users WHERE email = 'essens.vendor@giu-uni.de'),
    'available',
    'available'
),
(
    'Ftar w Asha',
    '/images/trucks/ftarwasha-logo.png',
    (SELECT userId FROM FoodTruck.Users WHERE email = 'ftarwasha.vendor@giu-uni.de'),
    'available',
    'available'
),
(
    'Loaded',
    '/images/trucks/loaded-logo.png',
    (SELECT userId FROM FoodTruck.Users WHERE email = 'loaded.vendor@giu-uni.de'),
    'available',
    'available'
);

-- Insert into User_Manage_Trucks junction table
INSERT INTO FoodTruck.User_Manage_Trucks (userId, truckId, permissions) VALUES
((SELECT userId FROM FoodTruck.Users WHERE email = 'demeshq.vendor@giu-uni.de'), 
 (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Demeshq'), 'full'),
((SELECT userId FROM FoodTruck.Users WHERE email = 'container.vendor@giu-uni.de'), 
 (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Container'), 'full'),
((SELECT userId FROM FoodTruck.Users WHERE email = 'essens.vendor@giu-uni.de'), 
 (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Essens'), 'full'),
((SELECT userId FROM FoodTruck.Users WHERE email = 'ftarwasha.vendor@giu-uni.de'), 
 (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Ftar w Asha'), 'full'),
((SELECT userId FROM FoodTruck.Users WHERE email = 'loaded.vendor@giu-uni.de'), 
 (SELECT truckId FROM FoodTruck.Trucks WHERE truckName = 'Loaded'), 'full');

-- Display seed results
SELECT 
    truckId,
    truckName,
    truckStatus,
    orderStatus
FROM FoodTruck.Trucks
ORDER BY truckId;

SELECT 'Food trucks seeded successfully!' as status;
