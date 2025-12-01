-- =====================================================
-- Seed Data: Users
-- Schema: FoodTruck
-- =====================================================

-- Clear existing data
TRUNCATE TABLE FoodTruck.Users CASCADE;
ALTER SEQUENCE FoodTruck.Users_userid_seq RESTART WITH 1;

-- Password for all test users: Test123!
-- Bcrypt hash for 'Test123!' (10 rounds): $2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC

-- Truck Owner Users (Food Truck Operators)
INSERT INTO FoodTruck.Users (name, email, password, role, birthDate) VALUES
('Ahmed Hassan', 'demeshq.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'truckOwner', '1985-03-15'),
('Mohamed Ali', 'container.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'truckOwner', '1987-07-22'),
('Fatma Ibrahim', 'essens.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'truckOwner', '1990-11-08'),
('Sara Mohamed', 'ftarwasha.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'truckOwner', '1988-05-19'),
('Omar Khaled', 'loaded.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'truckOwner', '1992-09-30');

-- Customer Users (Students and Staff)
INSERT INTO FoodTruck.Users (name, email, password, role, birthDate) VALUES
-- Team Members
('Hassan Yousef', 'hassan.yousef@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2002-01-15'),
('Sara Adel', 'sara.adel@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2002-03-22'),
('Hana Yasser', 'hana.yasser@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2001-11-08'),
('Mohamed Walid', 'mohamed.walid@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2002-07-12'),
('Omar Hani', 'omar.hani@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2001-09-25'),
('Abdelhamid ElSharnouby', 'abdelhamid.el@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2002-04-18'),
('Hanin Mohamed', 'hanin.mohamed@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2001-12-03'),
('Khaled Khaled', 'khaled.khaled@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2002-06-14'),

-- Additional Test Customers
('Ali Ahmed', 'ali.ahmed@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2001-08-20'),
('Nour Hassan', 'nour.hassan@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2002-02-11'),
('Youssef Ibrahim', 'youssef.ibrahim@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2001-10-05'),
('Mona Khaled', 'mona.khaled@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2002-05-28'),
('Karim Samy', 'karim.samy@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2001-07-16'),
('Laila Omar', 'laila.omar@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '2002-09-09'),

-- Staff Members
('Dr. Ahmed Refaat', 'ahmed.refaat@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '1980-04-12'),
('Prof. Maha Salem', 'maha.salem@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '1975-08-25');

-- Admin Users (System Administrators)
INSERT INTO FoodTruck.Users (name, email, password, role, birthDate) VALUES
('System Admin', 'admin@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'admin', '1990-01-01'),
('Platform Manager', 'platform.manager@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'admin', '1985-06-20');

-- Display seed results
SELECT 
    role,
    COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY role;

SELECT 'Users seeded successfully!' as status;
