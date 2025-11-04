-- Create businesses table matching Yelp Fusion API structure
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY, -- Yelp business ID
  name TEXT NOT NULL,
  image_url TEXT,
  yelp_url TEXT NOT NULL,
  price TEXT, -- "$", "$$", "$$$", "$$$$", or NULL
  rating NUMERIC(3, 1), -- 0.0 to 5.0
  review_count INTEGER DEFAULT 0,
  categories JSONB, -- Store array of {alias, title} objects
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  address_line3 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  country TEXT,
  display_address TEXT, -- Full formatted address from Yelp
  phone TEXT,
  display_phone TEXT, -- Formatted phone number
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS businesses_city_state_idx ON businesses (city, state);
CREATE INDEX IF NOT EXISTS businesses_categories_idx ON businesses USING GIN (categories);
CREATE INDEX IF NOT EXISTS businesses_location_idx ON businesses USING GIST (POINT(longitude, latitude));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

