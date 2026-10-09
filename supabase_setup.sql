-- ===================================================
-- M5 SmartSalon - Complete Supabase Database Setup
-- Copy and Paste this entire file into Supabase SQL Editor
-- ===================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('Customer', 'Barber', 'Admin');
CREATE TYPE booking_status AS ENUM ('Pending', 'Completed', 'No-Show');

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'Customer',
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  referral_code TEXT NOT NULL,
  last_visit_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS services (
  service_id TEXT PRIMARY KEY,
  service_name TEXT NOT NULL,
  price INT NOT NULL,
  duration_minutes INT NOT NULL,
  is_add_on BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'Hair'
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  booking_id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  service_ids TEXT[] NOT NULL,
  service_names TEXT[],
  total_bill INT NOT NULL,
  wallet_discount_used INT DEFAULT 0,
  final_paid INT NOT NULL,
  booking_date_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  status booking_status DEFAULT 'Pending'
);

-- 5. Marketing Logs Table
CREATE TABLE IF NOT EXISTS marketing_logs (
  log_id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  last_visit_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  days_inactive INT NOT NULL,
  message_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Disable Row Level Security for demo accessibility (or enable public RLS)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_logs DISABLE ROW LEVEL SECURITY;

-- 6. Insert Initial Seed Data
INSERT INTO users (user_id, name, phone_number, role, wallet_balance, referral_code, last_visit_date) VALUES
('usr-001', 'Ali Khan', '+92 300 1234567', 'Customer', 200.00, 'ALI500', NOW() - INTERVAL '26 days'),
('usr-002', 'Usman Tariq', '+92 321 9876543', 'Customer', 150.00, 'USMAN100', NOW() - INTERVAL '5 days'),
('usr-003', 'Hamza Ahmed', '+92 333 5554433', 'Customer', 0.00, 'HAMZA777', NOW() - INTERVAL '30 days'),
('usr-004', 'Zubair Gori', '+92 301 4250420', 'Barber', 0.00, 'ZUBAIRG', NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO services (service_id, service_name, price, duration_minutes, is_add_on, category) VALUES
('srv-101', 'Signature Haircut & Style', 600, 30, false, 'Hair Styling'),
('srv-102', 'Beard Royal Trim & Grooming', 400, 20, false, 'Beard Care'),
('srv-103', 'Luxury Charcoal Facial', 1200, 45, false, 'Skincare'),
('srv-104', 'Head & Shoulder Spa Massage', 800, 30, false, 'Relaxation'),
('srv-201', 'Refreshing Face Wash & Cleanse', 150, 10, true, 'Add-On'),
('srv-202', 'Precision Threading / Eyebrows', 100, 10, true, 'Add-On'),
('srv-203', 'Premium Hair Black/Brown Color', 500, 20, true, 'Add-On'),
('srv-204', 'Hot Towel Steam Treatment', 200, 10, true, 'Add-On')
ON CONFLICT (service_id) DO NOTHING;

INSERT INTO bookings (booking_id, customer_id, customer_name, customer_phone, service_ids, service_names, total_bill, wallet_discount_used, final_paid, booking_date_time, status) VALUES
('bk-901', 'usr-001', 'Ali Khan', '+92 300 1234567', ARRAY['srv-101', 'srv-201'], ARRAY['Signature Haircut & Style', 'Refreshing Face Wash & Cleanse'], 750, 100, 650, NOW() + INTERVAL '2 hours', 'Pending'),
('bk-902', 'usr-002', 'Usman Tariq', '+92 321 9876543', ARRAY['srv-102'], ARRAY['Beard Royal Trim & Grooming'], 400, 0, 400, NOW() - INTERVAL '3 hours', 'Completed')
ON CONFLICT (booking_id) DO NOTHING;
