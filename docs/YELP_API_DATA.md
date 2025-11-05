# Yelp API Data Fields Reference

This document outlines the Yelp Fusion API fields we're using and what data we need for the SipLocal application.

## Current Implementation

### Fields We're Capturing from Yelp API

Based on the Yelp Fusion API Business Search response, we're currently storing:

#### Basic Information
- **`id`**: Yelp business ID (primary key)
- **`name`**: Business name
- **`image_url`**: Single business image URL
- **`url`**: Yelp business page URL
- **`price`**: Price range ("$", "$$", "$$$", "$$$$", or null)
- **`rating`**: Star rating (0.0 to 5.0)
- **`review_count`**: Number of reviews on Yelp

#### Categories
- **`categories`**: Array of category objects (stored as JSONB)
  - Each category has `alias` and `title`
  - Example: `[{alias: "coffee", title: "Coffee & Tea"}, {alias: "cafes", title: "Cafes"}]`

#### Location
- **`latitude`**: Business latitude
- **`longitude`**: Business longitude
- **`address_line1`**: Street address line 1
- **`address_line2`**: Street address line 2 (if exists)
- **`address_line3`**: Street address line 3 (if exists)
- **`city`**: City name
- **`state`**: State abbreviation
- **`zip_code`**: ZIP code
- **`country`**: Country code
- **`display_address`**: Full formatted address (joined from Yelp's array)

#### Contact
- **`phone`**: Phone number (raw format)
- **`display_phone`**: Phone number (formatted for display)

### Current Database Schema

All these fields are stored in the `businesses` table in Supabase. See `database/schema.sql` for the complete schema.

## Yelp API Fields We're NOT Using (Yet)

The Yelp Fusion API provides additional fields that we're not currently capturing but might need for future features:

### Business Hours
- **`hours`**: Array of hours objects
  - Structure: `[{open: [{day: 0-6, start: "HHMM", end: "HHMM", is_overnight: boolean}]}]`
  - **Use Case**: Display business hours on detail page
  - **Status**: Not stored yet (can be added later)

### Photos
- **`photos`**: Array of photo URLs
  - Multiple images per business
  - **Use Case**: Photo gallery on business detail page
  - **Status**: Only storing single `image_url` currently
  - **Note**: Can fetch more photos via Yelp Business Details API

### Attributes
- **`attributes`**: Object with business attributes
  - Examples: WiFi availability, parking, outdoor seating, etc.
  - **Use Case**: Filter businesses by amenities
  - **Status**: Not stored yet (can be added later)

### Distance
- **`distance`**: Distance from search location (in meters)
  - **Use Case**: Sort by distance, show nearby businesses
  - **Status**: Not stored (calculated on-the-fly based on coordinates)

### Transactions
- **`transactions`**: Array of transaction types
  - Examples: "delivery", "pickup", "restaurant_reservation"
  - **Use Case**: Filter by service type
  - **Status**: Not stored yet (can be added later)

### Business Details API (Additional Endpoint)

For more detailed information, we can use the Yelp Business Details API (`/businesses/{id}`) which provides:

- **`hours`**: Detailed hours of operation
- **`photos`**: Full photo array
- **`attributes`**: Complete attributes object
- **`specialties`**: Specialties or specialties
- **`is_claimed`**: Whether business is claimed by owner
- **`is_closed`**: Whether business is permanently closed

## Data We Need for App Features

### For Current Features (Wireframe Phase)

✅ **Already Have:**
- Business name, image, rating, price
- Categories for filtering
- Location (address, coordinates) for maps
- Phone number for contact
- Yelp URL for linking

### For Future Features (Post-Wireframe)

#### 1. AI Summary Feature
- **Need**: Text field for AI-generated summaries
- **Solution**: Add `ai_summary` TEXT field to businesses table
- **Status**: Not implemented yet (will be added when implementing AI feature)

#### 2. Hours Display
- **Need**: Business hours for detail page
- **Solution**: Add `hours` JSONB field OR create separate `hours` table
- **Status**: Not implemented yet (can fetch from Yelp API when needed)

#### 3. Photo Gallery
- **Need**: Multiple photos per business
- **Solution**: 
  - Option A: Add `photos` JSONB array field
  - Option B: Create separate `business_photos` table
- **Status**: Only single image currently (can be expanded)

#### 4. Business Attributes
- **Need**: WiFi, parking, outdoor seating, etc.
- **Solution**: Add `attributes` JSONB field
- **Status**: Not implemented yet

#### 5. Reviews (User-Generated)
- **Need**: User reviews and ratings
- **Solution**: Create separate `reviews` table (not from Yelp API)
- **Status**: Not implemented yet (will be user-generated content)

#### 6. User Favorites
- **Need**: Users saving favorite businesses
- **Solution**: Create `user_favorites` junction table
- **Status**: Not implemented yet

#### 7. Business Owner Claims
- **Need**: Track claimed businesses
- **Solution**: Add `is_claimed` BOOLEAN and `claimed_by` TEXT fields
- **Status**: Not implemented yet

## Recommended Database Updates for Future Features

### Phase 1: Add AI Summary Support
```sql
ALTER TABLE businesses 
ADD COLUMN ai_summary TEXT;
```

### Phase 2: Add Hours and Photos
```sql
ALTER TABLE businesses 
ADD COLUMN hours JSONB,
ADD COLUMN photos JSONB;
```

### Phase 3: Add Attributes
```sql
ALTER TABLE businesses 
ADD COLUMN attributes JSONB;
```

### Phase 4: User-Generated Content
```sql
-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id),
  user_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User favorites
CREATE TABLE user_favorites (
  user_id TEXT NOT NULL,
  business_id TEXT REFERENCES businesses(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, business_id)
);
```

### Phase 5: Business Claims
```sql
ALTER TABLE businesses 
ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN claimed_by TEXT,
ADD COLUMN claimed_at TIMESTAMPTZ;
```

## Current Data Flow

1. **Yelp API** → Fetch businesses via `/businesses/search`
2. **Transform** → Convert Yelp format to our database format
3. **Store** → Upsert into Supabase `businesses` table
4. **Display** → Query from Supabase for UI

## Data Refresh Strategy

- **Initial Load**: Ingestion endpoint fetches all businesses
- **Updates**: Run ingestion again to update existing businesses (upsert)
- **New Businesses**: Automatically added when found in Yelp API
- **Rate Limiting**: 100ms delay between requests, respect Yelp's 5000/day limit

## References

- [Yelp Fusion API Documentation](https://www.yelp.com/developers/documentation/v3)
- [Business Search API](https://www.yelp.com/developers/documentation/v3/business_search)
- [Business Details API](https://www.yelp.com/developers/documentation/v3/business)

## Summary

**Current Status:**
- ✅ Basic business data captured and stored
- ✅ Location and contact information
- ✅ Categories for filtering
- ✅ Single image per business

**Future Needs:**
- ⏳ AI summary field
- ⏳ Business hours
- ⏳ Multiple photos
- ⏳ Business attributes
- ⏳ User reviews (separate from Yelp)
- ⏳ User favorites
- ⏳ Business claims

For the wireframe phase, our current data structure is sufficient. Additional fields can be added as features are implemented.

