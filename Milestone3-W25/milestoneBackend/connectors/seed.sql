
-- ====================================
-- Sample Data (Optional - for testing)
-- ====================================

-- Sample Users
insert into "FoodTruck"."Users"(name, email, password, role, "birthDate")
values('Ahmed Mohamed', 'ahmed@example.com', '$2b$10$hashedpassword1', 'customer', '1998-05-15');

insert into "FoodTruck"."Users"(name, email, password, role, "birthDate")
values('Sara Ali', 'sara@example.com', '$2b$10$hashedpassword2', 'truckOwner', '2000-08-22');

insert into "FoodTruck"."Users"(name, email, password, role, "birthDate")
values('Khaled Hassan', 'khaled@example.com', '$2b$10$hashedpassword3', 'truckOwner', '1995-03-10');


-- Sample Trucks
insert into "FoodTruck"."Trucks"("truckName", "truckLogo", "ownerId", "truckStatus", "orderStatus")
values('Tasty Tacos Truck', 'https://e...content-available-to-author-only...e.com/taco-logo.png', 2, 'available', 'available');

insert into "FoodTruck"."Trucks"("truckName", "truckLogo", "ownerId", "truckStatus", "orderStatus")
values('Burger Paradise', 'https://e...content-available-to-author-only...e.com/burger-logo.png', 3, 'available', 'available');


-- Sample Menu Items
insert into "FoodTruck"."MenuItems"("truckId", name, description, price, category, status)
values(1, 'Beef Burger', 'Delicious beef burger with cheese', 45.99, 'Main Course', 'available');

insert into "FoodTruck"."MenuItems"("truckId", name, description, price, category, status)
values(1, 'Chicken Wrap', 'Grilled chicken wrap with vegetables', 35.50, 'Main Course', 'available');

insert into "FoodTruck"."MenuItems"("truckId", name, description, price, category, status)
values(1, 'French Fries', 'Crispy golden fries', 15.00, 'Sides', 'available');

insert into "FoodTruck"."MenuItems"("truckId", name, description, price, category, status)
values(1, 'Soft Drink', 'Cold refreshing drink', 10.00, 'Beverages', 'available');

insert into "FoodTruck"."MenuItems"("truckId", name, description, price, category, status)
values(2, 'Classic Burger', 'Juicy beef patty with special sauce', 42.00, 'Main Course', 'available');

insert into "FoodTruck"."MenuItems"("truckId", name, description, price, category, status)
values(2, 'Cheese Fries', 'Fries topped with melted cheddar', 18.00, 'Sides', 'available');
