-- Fixed schema script that handles existing objects
-- Run this in Supabase SQL Editor to fix the trigger error

-- Create or replace function (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists, then recreate it
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;

-- Create the trigger
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

