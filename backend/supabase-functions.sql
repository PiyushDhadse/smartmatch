-- ===========================================
-- SmartMatch Supabase Database Functions
-- Run these in your Supabase SQL Editor
-- ===========================================

-- Function to increment provider total jobs count
CREATE OR REPLACE FUNCTION increment_provider_jobs(provider_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE service_providers
  SET total_jobs = total_jobs + 1
  WHERE id = provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update provider rating (call after a review is added)
CREATE OR REPLACE FUNCTION update_provider_rating(
  p_provider_id UUID,
  new_rating NUMERIC
)
RETURNS void AS $$
DECLARE
  current_total_jobs INTEGER;
  current_rating NUMERIC;
  updated_rating NUMERIC;
BEGIN
  SELECT total_jobs, rating INTO current_total_jobs, current_rating
  FROM service_providers
  WHERE id = p_provider_id;
  
  -- Calculate new average rating
  IF current_total_jobs = 0 THEN
    updated_rating := new_rating;
  ELSE
    updated_rating := ((current_rating * current_total_jobs) + new_rating) / (current_total_jobs + 1);
  END IF;
  
  UPDATE service_providers
  SET rating = ROUND(updated_rating, 2)
  WHERE id = p_provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- Row Level Security (RLS) Policies
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_tracking ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Services policies (public read, owner write)
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage their own services" ON services
  FOR ALL USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can view bookings for their services" ON bookings
  FOR SELECT USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers can update their booking status" ON bookings
  FOR UPDATE USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- Booking tracking policies
CREATE POLICY "Users can view tracking for their bookings" ON booking_tracking
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view tracking for their bookings" ON booking_tracking
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE provider_id IN (
        SELECT id FROM service_providers WHERE user_id = auth.uid()
      )
    )
  );

-- ===========================================
-- Indexes for better performance
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_location ON services(location);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);

CREATE INDEX IF NOT EXISTS idx_booking_tracking_booking ON booking_tracking(booking_id);

CREATE INDEX IF NOT EXISTS idx_service_providers_user ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_availability ON service_providers(availability_status);