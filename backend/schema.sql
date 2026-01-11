-- ===========================================
-- DROP ALL TABLES (Clean Start)
-- ===========================================
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS booking_tracking CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS provider_services CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===========================================
-- ENABLE EXTENSIONS
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- USERS TABLE (Simplified - Just for auth)
-- ===========================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'serviceProvider')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- TEST INSERT
-- ===========================================
INSERT INTO users (name, email, password, user_type) 
VALUES (
  'Test User',
  'test@example.com',
  '$2b$10$ExampleHash123', -- Fake hash for testing
  'customer'
);

-- ===========================================
-- VERIFY
-- ===========================================
SELECT * FROM users;