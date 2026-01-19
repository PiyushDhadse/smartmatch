-- ============================================
-- SMARTMATCH DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- ========== USERS TABLE ==========
-- Stores all users (both customers and providers)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  
  -- Role: 'customer' or 'provider'
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'provider')),
  
  -- Address for customers, business address for providers
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Verification status
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Account status
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ========== SERVICE_CATEGORIES TABLE ==========
-- Master list of service categories
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO service_categories (name, description, icon, display_order) VALUES
('Plumbing', 'Plumbing services including repairs, installations, and maintenance', '🔧', 1),
('Electrical', 'Electrical work, wiring, installations, and repairs', '⚡', 2),
('Cleaning', 'Home and office cleaning services', '🧹', 3),
('Carpentry', 'Woodwork, furniture, and structural carpentry', '🔨', 4),
('Painting', 'Interior and exterior painting services', '🎨', 5),
('Tutoring', 'Academic tutoring and teaching services', '📚', 6),
('Beauty & Salon', 'Hair, makeup, and beauty services', '💇', 7),
('Fitness & Yoga', 'Personal training and fitness coaching', '💪', 8),
('IT & Computer', 'Computer repair and IT support', '💻', 9),
('Moving & Transport', 'Moving and transportation services', '🚚', 10),
('Gardening', 'Landscaping and gardening services', '🌿', 11),
('Pest Control', 'Pest control and extermination services', '🐜', 12),
('Appliance Repair', 'Home appliance repair services', '🔌', 13),
('Event Planning', 'Event management and planning services', '🎉', 14),
('Photography', 'Professional photography services', '📷', 15)
ON CONFLICT (name) DO NOTHING;

-- ========== SERVICE_PROVIDERS TABLE ==========
-- Stores provider-specific information
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(200),
  business_description TEXT,
  business_logo TEXT,
  business_phone VARCHAR(20),
  business_email VARCHAR(255),
  
  -- Business registration details
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  
  -- Service area
  service_radius_km INTEGER DEFAULT 10,
  service_cities TEXT[], -- Array of cities served
  
  -- Provider stats
  total_jobs_completed INTEGER DEFAULT 0,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  response_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_documents TEXT[], -- Array of document URLs
  
  -- Bank details for payments
  bank_account_number VARCHAR(50),
  bank_name VARCHAR(100),
  ifsc_code VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id)
);

-- Indexes for service_providers
CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_availability ON service_providers(is_available, availability_status);
CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON service_providers(avg_rating DESC);

-- ========== PROVIDER_SERVICES TABLE ==========
-- Services offered by each provider
CREATE TABLE IF NOT EXISTS provider_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id),
  service_name VARCHAR(200) NOT NULL,
  service_description TEXT,
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  price_type VARCHAR(20) DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'per_sqft', 'custom')),
  price_unit VARCHAR(50), -- 'hour', 'sq ft', 'item', etc.
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  
  -- Service details
  experience_years INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Images for the service
  service_images TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(provider_id, category_id, service_name)
);

-- Indexes for provider_services
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id, is_active);
CREATE INDEX IF NOT EXISTS idx_provider_services_category ON provider_services(category_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_price ON provider_services(base_price);

-- ========== SERVICE_AVAILABILITY TABLE ==========
-- Provider's availability schedule
CREATE TABLE IF NOT EXISTS service_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  
  -- Recurring or specific date
  is_recurring BOOLEAN DEFAULT true,
  specific_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_times CHECK (end_time > start_time)
);

-- ========== BOOKINGS TABLE ==========
-- Main bookings/orders table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('BK-' || to_char(NOW(), 'YYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0')),
  
  -- Customer details
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Provider and service details
  provider_service_id UUID NOT NULL REFERENCES provider_services(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE RESTRICT,
  
  -- Service details snapshot (preserve at time of booking)
  service_name_snapshot VARCHAR(200) NOT NULL,
  service_description_snapshot TEXT,
  base_price_snapshot DECIMAL(10, 2) NOT NULL,
  price_type_snapshot VARCHAR(20) NOT NULL,
  
  -- Booking details
  booking_date DATE NOT NULL,
  time_slot_start TIME NOT NULL,
  time_slot_end TIME NOT NULL,
  
  -- Location details
  service_address TEXT NOT NULL,
  service_city VARCHAR(100) NOT NULL,
  service_zip_code VARCHAR(20),
  customer_latitude DECIMAL(10, 8),
  customer_longitude DECIMAL(11, 8),
  
  -- Problem/Service description
  problem_description TEXT,
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('emergency', 'urgent', 'normal')),
  
  -- Special requests
  special_instructions TEXT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Waiting for provider response
    'accepted',          -- Provider accepted
    'rejected',          -- Provider rejected
    'confirmed',         -- Customer confirmed after quote
    'scheduled',         -- Scheduled for service
    'in_progress',       -- Service started
    'completed',         -- Service completed
    'cancelled',         -- Cancelled by customer/provider
    'refunded',          -- Refund processed
    'disputed'           -- Dispute raised
  )),
  
  -- Payment details
  total_amount DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded', 'failed')),
  payment_method VARCHAR(50),
  
  -- Provider response
  provider_notes TEXT,
  quoted_amount DECIMAL(10, 2),
  quote_valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Completion details
  service_completed_at TIMESTAMP WITH TIME ZONE,
  customer_notes TEXT,
  
  -- Ratings (after completion)
  customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
  customer_review TEXT,
  provider_rating INTEGER CHECK (provider_rating BETWEEN 1 AND 5),
  provider_feedback TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_booking_date CHECK (booking_date >= CURRENT_DATE),
  CONSTRAINT valid_time_slot CHECK (time_slot_end > time_slot_start)
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);

-- ========== BOOKING_TRACKING TABLE ==========
-- Track status changes and updates
CREATE TABLE IF NOT EXISTS booking_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(50) NOT NULL, -- 'customer', 'provider', 'system', 'admin'
  changed_by_id UUID, -- User ID who changed it
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for booking tracking
CREATE INDEX IF NOT EXISTS idx_booking_tracking_booking ON booking_tracking(booking_id, created_at DESC);

-- ========== QUOTATIONS TABLE ==========
-- Detailed quotations for bookings
CREATE TABLE IF NOT EXISTS quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- Quote details
  quote_amount DECIMAL(10, 2) NOT NULL,
  labor_charges DECIMAL(10, 2),
  material_charges DECIMAL(10, 2),
  other_charges DECIMAL(10, 2),
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Terms
  validity_days INTEGER DEFAULT 7,
  payment_terms TEXT,
  warranty_period VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  
  -- Response
  customer_response VARCHAR(20),
  response_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(booking_id)
);

-- ========== PAYMENTS TABLE ==========
-- Payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES users(id),
  provider_id UUID NOT NULL REFERENCES service_providers(id),
  
  -- Payment details
  payment_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('PAY-' || to_char(NOW(), 'YYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(200),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  failure_reason TEXT,
  
  -- Gateway response
  gateway_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);

-- ========== REVIEWS TABLE ==========
-- Separate reviews table for better querying
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id), -- Customer who reviews
  reviewed_id UUID NOT NULL, -- Provider being reviewed (can be user_id or provider_id)
  review_type VARCHAR(20) CHECK (review_type IN ('customer_to_provider', 'provider_to_customer')),
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  comment TEXT NOT NULL,
  
  -- Response
  response_text TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  
  -- Flags
  is_verified_booking BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON reviews(reviewed_id, review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified_booking);

-- ========== NOTIFICATIONS TABLE ==========
-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification details
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'booking_request', 'booking_accepted', 'booking_rejected', 
    'booking_confirmed', 'booking_completed', 'payment_received',
    'new_review', 'message_received', 'system_alert', 'promotion'
  )),
  
  -- Reference to related entity
  reference_type VARCHAR(50), -- 'booking', 'payment', 'message', etc.
  reference_id UUID,
  
  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Action
  action_url TEXT,
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at);

-- ========== MESSAGES TABLE ==========
-- Communication between users
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Participants
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Message content
  message_text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'quote')),
  
  -- Attachments
  attachment_url TEXT,
  attachment_name VARCHAR(255),
  
  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Delivery status
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_sender_receiver CHECK (sender_id != receiver_id)
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(
  LEAST(sender_id, receiver_id), 
  GREATEST(sender_id, receiver_id), 
  created_at DESC
);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read);

-- ========== FAVORITES TABLE ==========
-- Customers can save favorite providers
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, provider_id)
);

-- ========== SEARCH_HISTORY TABLE ==========
-- Track user searches for recommendations
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_filters JSONB,
  search_results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
DO $$ 
DECLARE 
  table_name text;
BEGIN 
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'users', 'service_providers', 'provider_services', 
      'bookings', 'quotations', 'payments', 'reviews'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
      CREATE TRIGGER update_%s_updated_at
      BEFORE UPDATE ON %s
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := 'BK-' || to_char(NOW(), 'YYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for booking number
CREATE TRIGGER generate_booking_number_trigger
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION generate_booking_number();

-- Function to update provider stats when booking is completed
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update provider's completed jobs count
    UPDATE service_providers 
    SET total_jobs_completed = total_jobs_completed + 1
    WHERE id = NEW.provider_id;
    
    -- Update provider rating if customer rated
    IF NEW.customer_rating IS NOT NULL THEN
      UPDATE service_providers 
      SET 
        total_reviews = total_reviews + 1,
        avg_rating = (
          (avg_rating * total_reviews) + NEW.customer_rating
        ) / (total_reviews + 1)
      WHERE id = NEW.provider_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for provider stats
CREATE TRIGGER update_provider_stats_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_provider_stats();

-- Function to create booking tracking record
CREATE OR REPLACE FUNCTION create_booking_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO booking_tracking (
      booking_id, from_status, to_status, changed_by, changed_by_id
    ) VALUES (
      NEW.id, OLD.status, NEW.status, 'system', NEW.customer_id
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for booking tracking
CREATE TRIGGER create_booking_tracking_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION create_booking_tracking();

-- Function to check provider availability
CREATE OR REPLACE FUNCTION check_provider_availability(
  p_provider_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  is_available BOOLEAN;
  day_of_week INTEGER;
BEGIN
  -- Get day of week (0=Sunday, 6=Saturday)
  day_of_week := EXTRACT(DOW FROM p_booking_date);
  
  -- Check if provider has availability for this day and time
  SELECT EXISTS (
    SELECT 1 FROM service_availability 
    WHERE provider_id = p_provider_id 
    AND (
      (is_recurring = true AND day_of_week = day_of_week)
      OR (is_recurring = false AND specific_date = p_booking_date)
    )
    AND start_time <= p_start_time
    AND end_time >= p_end_time
    AND is_available = true
  ) INTO is_available;
  
  -- Also check if provider is not already booked at this time
  IF is_available THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM bookings 
      WHERE provider_id = p_provider_id
      AND booking_date = p_booking_date
      AND status NOT IN ('cancelled', 'rejected')
      AND (
        (time_slot_start < p_end_time AND time_slot_end > p_start_time)
      )
    ) INTO is_available;
  END IF;
  
  RETURN is_available;
END;
$$ language 'plpgsql';

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View for customer dashboard
CREATE OR REPLACE VIEW customer_dashboard_view AS
SELECT 
  b.id,
  b.booking_number,
  b.customer_id,
  b.provider_id,
  b.service_name_snapshot as service_name,
  b.booking_date,
  b.time_slot_start,
  b.time_slot_end,
  b.status,
  b.payment_status,
  b.final_amount,
  b.created_at,
  sp.business_name as provider_name,
  u.avatar_url as provider_avatar,
  sc.name as category_name
FROM bookings b
JOIN service_providers sp ON b.provider_id = sp.id
JOIN users u ON sp.user_id = u.id
JOIN provider_services ps ON b.provider_service_id = ps.id
JOIN service_categories sc ON ps.category_id = sc.id;

-- View for provider dashboard
CREATE OR REPLACE VIEW provider_dashboard_view AS
SELECT 
  b.id,
  b.booking_number,
  b.customer_id,
  b.provider_id,
  b.service_name_snapshot as service_name,
  b.booking_date,
  b.time_slot_start,
  b.time_slot_end,
  b.status,
  b.payment_status,
  b.final_amount,
  b.created_at,
  u.name as customer_name,
  u.avatar_url as customer_avatar,
  u.phone as customer_phone,
  sc.name as category_name,
  b.problem_description
FROM bookings b
JOIN users u ON b.customer_id = u.id
JOIN provider_services ps ON b.provider_service_id = ps.id
JOIN service_categories sc ON ps.category_id = sc.id;

-- View for admin reporting
CREATE OR REPLACE VIEW admin_reports_view AS
SELECT 
  DATE(created_at) as report_date,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_bookings,
  SUM(CASE WHEN payment_status = 'paid' THEN final_amount ELSE 0 END) as total_revenue,
  COUNT(DISTINCT customer_id) as unique_customers,
  COUNT(DISTINCT provider_id) as active_providers
FROM bookings
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY report_date DESC;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
DO $$ 
DECLARE 
  table_name text;
BEGIN 
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'users', 'service_providers', 'provider_services', 'bookings',
      'quotations', 'payments', 'reviews', 'notifications', 'messages',
      'favorites', 'search_history'
    )
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY;', table_name);
  END LOOP;
END $$;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Customers can view their bookings
CREATE POLICY "Customers can view own bookings" ON bookings
FOR SELECT USING (auth.uid() = customer_id);

-- Providers can view their bookings
CREATE POLICY "Providers can view their bookings" ON bookings
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM service_providers WHERE id = bookings.provider_id
  )
);

-- Providers can update their bookings status
CREATE POLICY "Providers can update booking status" ON bookings
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM service_providers WHERE id = bookings.provider_id
  )
);

-- Users can view their own messages
CREATE POLICY "Users can view own messages" ON messages
FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));

-- Users can insert their own messages
CREATE POLICY "Users can send messages" ON messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample users (password: 'password123')
INSERT INTO users (email, password_hash, name, phone, role, city) VALUES
('customer1@example.com', '$2a$10$abc123...', 'John Customer', '9876543210', 'customer', 'Mumbai'),
('provider1@example.com', '$2a$10$abc123...', 'Raj Sharma', '9876543211', 'provider', 'Mumbai'),
('provider2@example.com', '$2a$10$abc123...', 'Priya Patel', '9876543212', 'provider', 'Delhi')
ON CONFLICT (email) DO NOTHING;

-- Insert service providers
INSERT INTO service_providers (user_id, business_name, business_description, service_cities, avg_rating) 
SELECT 
  u.id, 
  CASE 
    WHEN u.name = 'Raj Sharma' THEN 'Sharma Plumbing Services'
    WHEN u.name = 'Priya Patel' THEN 'Patel Electrical Works'
  END,
  CASE 
    WHEN u.name = 'Raj Sharma' THEN 'Expert plumbing services with 10 years experience'
    WHEN u.name = 'Priya Patel' THEN 'Certified electrical services for homes and offices'
  END,
  CASE 
    WHEN u.name = 'Raj Sharma' THEN ARRAY['Mumbai', 'Thane', 'Navi Mumbai']
    WHEN u.name = 'Priya Patel' THEN ARRAY['Delhi', 'Noida', 'Gurgaon']
  END,
  4.5
FROM users u 
WHERE u.role = 'provider' 
AND u.name IN ('Raj Sharma', 'Priya Patel')
ON CONFLICT (user_id) DO NOTHING;

-- Insert provider services
INSERT INTO provider_services (provider_id, category_id, service_name, service_description, base_price, price_type)
SELECT 
  sp.id,
  sc.id,
  CASE 
    WHEN sc.name = 'Plumbing' THEN 'Pipe Repair and Installation'
    WHEN sc.name = 'Electrical' THEN 'Wiring and Electrical Repair'
  END,
  CASE 
    WHEN sc.name = 'Plumbing' THEN 'Complete pipe repair and installation services'
    WHEN sc.name = 'Electrical' THEN 'Professional wiring and electrical repair'
  END,
  CASE 
    WHEN sc.name = 'Plumbing' THEN 1500.00
    WHEN sc.name = 'Electrical' THEN 2000.00
  END,
  'fixed'
FROM service_providers sp
CROSS JOIN service_categories sc
WHERE sc.name IN ('Plumbing', 'Electrical')
ON CONFLICT (provider_id, category_id, service_name) DO NOTHING;

-- ============================================
-- FINAL MESSAGE
-- ============================================

SELECT '✅ Database schema created successfully!' as message;
SELECT COUNT(*) as tables_created FROM pg_tables WHERE schemaname = 'public';

-- ============================================
-- COMPLETE REVIEWS TABLE FIX (CORRECTED - NO SUBQUERIES IN CHECK)
-- ============================================

-- First, let's drop the current reviews table and recreate it properly
DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Reference to the booking that generated this review
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Who wrote the review
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Who is being reviewed (based on review type)
  -- For customer_to_provider: reviewed_provider_id
  -- For provider_to_customer: reviewed_customer_id
  reviewed_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  reviewed_customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Store provider's user_id for easier validation (denormalized)
  reviewed_provider_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Review type
  review_type VARCHAR(30) NOT NULL CHECK (review_type IN ('customer_to_provider', 'provider_to_customer')),
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  comment TEXT NOT NULL,
  
  -- Categories for filtering (e.g., punctuality, quality, communication)
  rating_categories JSONB DEFAULT '{}'::jsonb,
  
  -- Response from the reviewed party
  response_text TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  
  -- Moderation
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'flagged', 'hidden', 'deleted')),
  flagged_by_admin BOOLEAN DEFAULT false,
  flag_reason TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Verification
  is_verified_booking BOOLEAN DEFAULT true,
  verification_method VARCHAR(50), -- 'auto', 'manual', 'admin'
  
  -- Helpful votes
  helpful_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints (NO SUBQUERIES ALLOWED)
  CONSTRAINT valid_review_target CHECK (
    (review_type = 'customer_to_provider' AND reviewed_provider_id IS NOT NULL AND reviewed_customer_id IS NULL)
    OR
    (review_type = 'provider_to_customer' AND reviewed_customer_id IS NOT NULL AND reviewed_provider_id IS NULL)
  ),
  CONSTRAINT one_review_per_booking_per_type UNIQUE(booking_id, review_type)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index for finding reviews by provider
CREATE INDEX idx_reviews_provider ON reviews(reviewed_provider_id) 
WHERE reviewed_provider_id IS NOT NULL;

-- Index for finding reviews by customer
CREATE INDEX idx_reviews_customer ON reviews(reviewed_customer_id) 
WHERE reviewed_customer_id IS NOT NULL;

-- Index for finding reviews by reviewer
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

-- Index for average rating calculations
CREATE INDEX idx_reviews_rating_provider ON reviews(reviewed_provider_id, rating) 
WHERE reviewed_provider_id IS NOT NULL AND status = 'published';

CREATE INDEX idx_reviews_rating_customer ON reviews(reviewed_customer_id, rating) 
WHERE reviewed_customer_id IS NOT NULL AND status = 'published';

-- Index for recent reviews
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC) 
WHERE status = 'published';

-- Index for moderation
CREATE INDEX idx_reviews_status ON reviews(status) 
WHERE status IN ('pending', 'flagged');

-- Index for provider user_id (for self-review check)
CREATE INDEX idx_reviews_provider_user ON reviews(reviewed_provider_user_id) 
WHERE reviewed_provider_user_id IS NOT NULL;

-- ============================================
-- FUNCTIONS FOR DATA INTEGRITY
-- ============================================

-- Function to populate reviewed_provider_user_id and validate no self-reviews
CREATE OR REPLACE FUNCTION set_reviewed_provider_user_id()
RETURNS TRIGGER AS $$
DECLARE
  provider_user_id UUID;
BEGIN
  -- Set reviewed_provider_user_id if we have a provider
  IF NEW.reviewed_provider_id IS NOT NULL THEN
    SELECT user_id INTO provider_user_id
    FROM service_providers
    WHERE id = NEW.reviewed_provider_id;
    
    IF provider_user_id IS NULL THEN
      RAISE EXCEPTION 'Provider not found';
    END IF;
    
    NEW.reviewed_provider_user_id := provider_user_id;
    
    -- Check for self-review (customer reviewing themselves as provider)
    IF NEW.reviewer_id = provider_user_id THEN
      RAISE EXCEPTION 'Cannot review yourself';
    END IF;
  END IF;
  
  -- Check for self-review (provider reviewing themselves as customer)
  IF NEW.reviewed_customer_id IS NOT NULL AND NEW.reviewer_id = NEW.reviewed_customer_id THEN
    RAISE EXCEPTION 'Cannot review yourself';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set provider user_id and prevent self-reviews
CREATE TRIGGER set_reviewed_provider_user_id_trigger
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION set_reviewed_provider_user_id();

-- Function to validate review belongs to actual booking participants
CREATE OR REPLACE FUNCTION validate_review_participants()
RETURNS TRIGGER AS $$
DECLARE
  booking_record RECORD;
  provider_user_id UUID;
BEGIN
  -- Get booking details
  SELECT customer_id, provider_id INTO booking_record
  FROM bookings 
  WHERE id = NEW.booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Validate based on review type
  IF NEW.review_type = 'customer_to_provider' THEN
    -- Customer reviewing provider
    IF NEW.reviewer_id != booking_record.customer_id THEN
      RAISE EXCEPTION 'Reviewer must be the customer from the booking';
    END IF;
    
    -- Get provider's user_id from service_providers
    SELECT user_id INTO provider_user_id
    FROM service_providers
    WHERE id = booking_record.provider_id;
    
    IF NEW.reviewed_provider_id != booking_record.provider_id THEN
      RAISE EXCEPTION 'Reviewed provider must match booking provider';
    END IF;
    
  ELSIF NEW.review_type = 'provider_to_customer' THEN
    -- Provider reviewing customer
    -- Get provider's user_id
    SELECT user_id INTO provider_user_id
    FROM service_providers
    WHERE id = booking_record.provider_id;
    
    IF NEW.reviewer_id != provider_user_id THEN
      RAISE EXCEPTION 'Reviewer must be the provider from the booking';
    END IF;
    
    IF NEW.reviewed_customer_id != booking_record.customer_id THEN
      RAISE EXCEPTION 'Reviewed customer must match booking customer';
    END IF;
  END IF;
  
  -- Verify booking is completed
  IF NOT EXISTS (
    SELECT 1 FROM bookings 
    WHERE id = NEW.booking_id 
    AND status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Can only review completed bookings';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for validation
CREATE TRIGGER validate_review_participants_trigger
BEFORE INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION validate_review_participants();

-- Function to update provider ratings automatically
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  provider_rating DECIMAL(3,2);
  total_reviews_count INTEGER;
BEGIN
  IF NEW.review_type = 'customer_to_provider' AND NEW.status = 'published' THEN
    -- Calculate new average rating for provider
    SELECT 
      COALESCE(AVG(rating), 0),
      COUNT(*)
    INTO 
      provider_rating,
      total_reviews_count
    FROM reviews
    WHERE reviewed_provider_id = NEW.reviewed_provider_id
      AND status = 'published'
      AND review_type = 'customer_to_provider';
    
    -- Update provider's rating
    UPDATE service_providers
    SET 
      avg_rating = provider_rating,
      total_reviews = total_reviews_count,
      updated_at = NOW()
    WHERE id = NEW.reviewed_provider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
CREATE TRIGGER update_provider_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.review_type = 'customer_to_provider')
EXECUTE FUNCTION update_provider_rating();

-- Function to prevent multiple responses
CREATE OR REPLACE FUNCTION prevent_multiple_responses()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.response_text IS NOT NULL AND OLD.response_text IS NOT NULL THEN
    RAISE EXCEPTION 'Response already exists. Cannot update existing response.';
  END IF;
  
  -- Only allow response within 30 days of review
  IF NEW.response_text IS NOT NULL AND OLD.response_text IS NULL THEN
    IF OLD.created_at < NOW() - INTERVAL '30 days' THEN
      RAISE EXCEPTION 'Cannot respond to reviews older than 30 days';
    END IF;
    
    -- Set response date
    NEW.response_date = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for response validation
CREATE TRIGGER prevent_multiple_responses_trigger
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION prevent_multiple_responses();

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View for provider reviews
CREATE OR REPLACE VIEW provider_reviews_view AS
SELECT 
  r.id,
  r.booking_id,
  r.reviewer_id,
  r.reviewed_provider_id,
  r.rating,
  r.title,
  r.comment,
  r.response_text,
  r.response_date,
  r.created_at,
  r.helpful_votes,
  r.total_votes,
  u.name as reviewer_name,
  u.avatar_url as reviewer_avatar,
  sp.business_name as provider_business_name,
  b.service_name_snapshot as service_name,
  b.booking_date,
  -- Calculate helpful percentage
  CASE 
    WHEN r.total_votes > 0 THEN 
      (r.helpful_votes * 100.0 / r.total_votes)
    ELSE 0 
  END as helpful_percentage,
  -- Format date
  to_char(r.created_at, 'DD Mon YYYY') as review_date_formatted
FROM reviews r
JOIN users u ON r.reviewer_id = u.id
JOIN service_providers sp ON r.reviewed_provider_id = sp.id
JOIN bookings b ON r.booking_id = b.id
WHERE r.review_type = 'customer_to_provider'
  AND r.status = 'published'
ORDER BY r.created_at DESC;

-- View for customer reviews (when providers review customers)
CREATE OR REPLACE VIEW customer_reviews_view AS
SELECT 
  r.id,
  r.booking_id,
  r.reviewer_id,
  r.reviewed_customer_id,
  r.rating,
  r.title,
  r.comment,
  r.response_text,
  r.response_date,
  r.created_at,
  u_reviewer.name as reviewer_name,
  u_reviewer.avatar_url as reviewer_avatar,
  sp.business_name as provider_business_name,
  u_customer.name as customer_name,
  u_customer.avatar_url as customer_avatar,
  b.service_name_snapshot as service_name,
  b.booking_date
FROM reviews r
JOIN service_providers sp ON r.reviewer_id = sp.user_id
JOIN users u_reviewer ON r.reviewer_id = u_reviewer.id
JOIN users u_customer ON r.reviewed_customer_id = u_customer.id
JOIN bookings b ON r.booking_id = b.id
WHERE r.review_type = 'provider_to_customer'
  AND r.status = 'published'
ORDER BY r.created_at DESC;

-- View for admin moderation queue
CREATE OR REPLACE VIEW review_moderation_queue AS
SELECT 
  r.id,
  r.booking_id,
  r.review_type,
  r.rating,
  r.title,
  r.comment,
  r.status,
  r.created_at,
  r.flagged_by_admin,
  r.flag_reason,
  CASE 
    WHEN r.review_type = 'customer_to_provider' THEN
      (SELECT business_name FROM service_providers WHERE id = r.reviewed_provider_id)
    ELSE
      (SELECT name FROM users WHERE id = r.reviewed_customer_id)
  END as reviewed_entity,
  u.name as reviewer_name,
  u.email as reviewer_email
FROM reviews r
JOIN users u ON r.reviewer_id = u.id
WHERE r.status IN ('pending', 'flagged')
ORDER BY r.created_at DESC;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get provider's average rating with details
CREATE OR REPLACE FUNCTION get_provider_rating_details(provider_uuid UUID)
RETURNS TABLE (
  avg_rating DECIMAL(3,2),
  total_reviews INTEGER,
  five_star INTEGER,
  four_star INTEGER,
  three_star INTEGER,
  two_star INTEGER,
  one_star INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(*) as total_reviews,
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star,
    COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star,
    COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star,
    COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star,
    COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star
  FROM reviews r
  WHERE r.reviewed_provider_id = provider_uuid
    AND r.status = 'published'
    AND r.review_type = 'customer_to_provider';
END;
$$ LANGUAGE plpgsql;

-- Function to vote on review helpfulness
CREATE OR REPLACE FUNCTION vote_review_helpful(
  review_uuid UUID,
  is_helpful BOOLEAN
) RETURNS VOID AS $$
BEGIN
  UPDATE reviews
  SET 
    helpful_votes = CASE WHEN is_helpful THEN helpful_votes + 1 ELSE helpful_votes END,
    total_votes = total_votes + 1,
    updated_at = NOW()
  WHERE id = review_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to submit a review (with validation)
CREATE OR REPLACE FUNCTION submit_review(
  p_booking_id UUID,
  p_reviewer_id UUID,
  p_rating INTEGER,
  p_comment TEXT,
  p_title TEXT DEFAULT NULL,
  p_rating_categories JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_review_id UUID;
  v_review_type VARCHAR(30);
  v_reviewed_provider_id UUID;
  v_reviewed_customer_id UUID;
  v_booking_record RECORD;
  v_provider_user_id UUID;
BEGIN
  -- Get booking details
  SELECT customer_id, provider_id, status INTO v_booking_record
  FROM bookings 
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  IF v_booking_record.status != 'completed' THEN
    RAISE EXCEPTION 'Can only review completed bookings';
  END IF;
  
  -- Determine review type
  IF p_reviewer_id = v_booking_record.customer_id THEN
    v_review_type := 'customer_to_provider';
    v_reviewed_provider_id := v_booking_record.provider_id;
    v_reviewed_customer_id := NULL;
    
    -- Get provider's user_id for self-review check
    SELECT user_id INTO v_provider_user_id
    FROM service_providers 
    WHERE id = v_reviewed_provider_id;
    
    IF p_reviewer_id = v_provider_user_id THEN
      RAISE EXCEPTION 'Cannot review yourself';
    END IF;
  ELSE
    -- Check if reviewer is the provider
    SELECT user_id INTO v_provider_user_id
    FROM service_providers 
    WHERE id = v_booking_record.provider_id;
    
    IF v_provider_user_id = p_reviewer_id THEN
      v_review_type := 'provider_to_customer';
      v_reviewed_customer_id := v_booking_record.customer_id;
      v_reviewed_provider_id := NULL;
      
      IF p_reviewer_id = v_reviewed_customer_id THEN
        RAISE EXCEPTION 'Cannot review yourself';
      END IF;
    ELSE
      RAISE EXCEPTION 'Reviewer must be either customer or provider from the booking';
    END IF;
  END IF;
  
  -- Insert the review
  INSERT INTO reviews (
    booking_id,
    reviewer_id,
    reviewed_provider_id,
    reviewed_customer_id,
    review_type,
    rating,
    title,
    comment,
    rating_categories,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_booking_id,
    p_reviewer_id,
    v_reviewed_provider_id,
    v_reviewed_customer_id,
    v_review_type,
    p_rating,
    p_title,
    p_comment,
    p_rating_categories,
    'published', -- Auto-publish for now, could be 'pending' for moderation
    NOW(),
    NOW()
  ) RETURNING id INTO v_review_id;
  
  RETURN v_review_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY POLICIES (CORRECTED)
-- ============================================

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view published reviews
CREATE POLICY "view_published_reviews" ON reviews
FOR SELECT USING (status = 'published');

-- Policy 2: Users can view their own reviews (all statuses)
CREATE POLICY "view_own_reviews" ON reviews
FOR SELECT USING (
  -- User is the reviewer
  auth.uid() = reviewer_id 
  OR 
  -- User is the reviewed customer
  auth.uid() = reviewed_customer_id
  OR
  -- User is the provider being reviewed (using denormalized field)
  auth.uid() = reviewed_provider_user_id
);

-- Policy 3: Admins can view all reviews
CREATE POLICY "admin_view_all_reviews" ON reviews
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin' -- Assuming you have an admin role in users table
  )
);

-- Policy 4: Users can insert their own reviews
CREATE POLICY "insert_own_reviews" ON reviews
FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Policy 5: Users can update their own unpublished reviews (within 24 hours)
CREATE POLICY "update_own_unpublished_reviews" ON reviews
FOR UPDATE USING (
  -- User is the reviewer
  auth.uid() = reviewer_id 
  AND 
  -- Review is not yet published
  status IN ('pending', 'draft') 
  AND 
  -- Within 24 hours of creation
  created_at > NOW() - INTERVAL '24 hours'
);

-- Policy 6: Providers can add responses to reviews about them
CREATE POLICY "provider_add_response" ON reviews
FOR UPDATE USING (
  -- User is the provider being reviewed (using denormalized field)
  auth.uid() = reviewed_provider_user_id
  AND 
  -- No response exists yet
  response_text IS NULL
  AND
  -- Review is published
  status = 'published'
  AND
  -- Review is about provider (not customer)
  review_type = 'customer_to_provider'
  AND
  -- Within 30 days of review
  created_at > NOW() - INTERVAL '30 days'
);

-- Policy 7: Admins can update any review for moderation
CREATE POLICY "admin_moderate_reviews" ON reviews
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy 8: Users can delete their own unpublished reviews
CREATE POLICY "delete_own_unpublished_reviews" ON reviews
FOR DELETE USING (
  auth.uid() = reviewer_id 
  AND 
  status IN ('pending', 'draft')
  AND 
  created_at > NOW() - INTERVAL '24 hours'
);

-- ============================================
-- CREATE ADMIN ROLE IF NOT EXISTS
-- ============================================

-- Add admin role to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin'));
  END IF;
END $$;

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================

-- First create some completed bookings and providers
/*
-- Insert a sample admin user
INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@example.com', 'hashed_password', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample reviews after creating bookings
INSERT INTO reviews (
  booking_id,
  reviewer_id,
  reviewed_provider_id,
  reviewed_customer_id,
  review_type,
  rating,
  title,
  comment,
  status,
  created_at
) 
SELECT 
  b.id as booking_id,
  b.customer_id as reviewer_id,
  b.provider_id as reviewed_provider_id,
  NULL as reviewed_customer_id,
  'customer_to_provider' as review_type,
  5 as rating,
  'Excellent service!' as title,
  'The plumber arrived on time and fixed the issue quickly. Highly recommended!' as comment,
  'published' as status,
  NOW() - INTERVAL '5 days' as created_at
FROM bookings b
WHERE b.status = 'completed'
LIMIT 3;
*/

-- ============================================
-- TEST QUERIES
-- ============================================

-- Test: Check table structure
/*
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
*/

-- Test: Get provider reviews
/*
SELECT * FROM provider_reviews_view 
WHERE reviewed_provider_id = (SELECT id FROM service_providers LIMIT 1);
*/

-- Test: Use helper function
/*
SELECT * FROM get_provider_rating_details((SELECT id FROM service_providers LIMIT 1));
*/

-- ============================================
-- FINAL MESSAGE
-- ============================================

SELECT '✅ Reviews table created successfully!' as message;
SELECT '🔑 Key Features:' as info;
SELECT '   • No self-reviews (trigger-based validation)' as feature;
SELECT '   • Automatic provider rating updates' as feature;
SELECT '   • Response system with time limits' as feature;
SELECT '   • Moderation workflow' as feature;
SELECT '   • Row Level Security (RLS)' as feature;
SELECT '   • Performance indexes' as feature;
SELECT '   • Helper functions for API integration' as feature;