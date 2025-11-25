-- =====================================================
-- Seed Data: Users
-- =====================================================

-- Clear existing data
TRUNCATE TABLE users CASCADE;
RESET SEQUENCE users_id_seq;

-- Admin Users
-- Password for all test users: Test123!
-- Bcrypt hash for 'Test123!' (10 rounds): $2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC

INSERT INTO users (name, email, password, role, phone, is_active, email_verified) VALUES
('System Admin', 'admin@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'admin', '+201234567890', TRUE, TRUE),
('Dr. Iman Awaad', 'iman.awaad@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'admin', '+201234567891', TRUE, TRUE);

-- Vendor Users (Food Truck Operators)
INSERT INTO users (name, email, password, role, phone, is_active, email_verified) VALUES
('Ahmed Hassan', 'demeshq.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'vendor', '+201012345671', TRUE, TRUE),
('Mohamed Ali', 'container.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'vendor', '+201012345672', TRUE, TRUE),
('Fatma Ibrahim', 'essens.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'vendor', '+201012345673', TRUE, TRUE),
('Sara Mohamed', 'ftarwasha.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'vendor', '+201012345674', TRUE, TRUE),
('Omar Khaled', 'loaded.vendor@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'vendor', '+201012345675', TRUE, TRUE);

-- Customer Users (Students and Staff)
INSERT INTO users (name, email, password, role, phone, is_active, email_verified) VALUES
-- Team Members
('Hassan Yousef', 'hassan.yousef@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201111111111', TRUE, TRUE),
('Sara Adel', 'sara.adel@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201111111112', TRUE, TRUE),
('Hana Yasser', 'hana.yasser@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201111111113', TRUE, TRUE),
('Mohamed Walid', 'mohamed.walid@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201111111114', TRUE, TRUE),
('Omar Hani', 'omar.hani@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201111111115', TRUE, TRUE),
('Abdelhamid ElSharnouby', 'abdelhamid.el@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201111111116', TRUE, TRUE),
('Hanin Mohamed', 'hanin.mohamed@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201111111117', TRUE, TRUE),
('Khaled Khaled', 'khaled.khaled@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201111111118', TRUE, TRUE),

-- Additional Test Customers
('Ali Ahmed', 'ali.ahmed@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201222222221', TRUE, TRUE),
('Nour Hassan', 'nour.hassan@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201222222222', TRUE, TRUE),
('Youssef Ibrahim', 'youssef.ibrahim@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201222222223', TRUE, TRUE),
('Mona Khaled', 'mona.khaled@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201222222224', TRUE, TRUE),
('Karim Samy', 'karim.samy@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201222222225', TRUE, TRUE),
('Laila Omar', 'laila.omar@student.giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201222222226', TRUE, TRUE);

-- Staff Members
INSERT INTO users (name, email, password, role, phone, is_active, email_verified) VALUES
('Dr. Ahmed Refaat', 'ahmed.refaat@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201333333331', TRUE, TRUE),
('Prof. Maha Salem', 'maha.salem@giu-uni.de', '$2b$10$/tPgF2l3tD5cpIRvXYkv0OP0NQ71ZqLMvKLTP0mIZatnna4kMBOPC', 'customer', '+201333333332', TRUE, TRUE);

-- Display seed results
SELECT 
    role,
    COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY role;

SELECT 'Users seeded successfully!' as status;
