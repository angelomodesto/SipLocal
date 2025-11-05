# Database Migrations Guide

This document outlines database schema updates needed as the SipLocal application evolves.

## Current Schema Status

### ✅ Current Implementation (v1.0)
The current `businesses` table includes all essential fields for the wireframe phase:
- Basic information (name, image, rating, price, categories)
- Location data (address, coordinates)
- Contact information (phone)
- Timestamps (created_at, updated_at)

**Status:** ✅ Complete and sufficient for wireframe implementation

## Future Migrations

### Migration 1: Add AI Summary Support
**When:** Implementing AI summary feature  
**Purpose:** Store AI-generated business summaries

```sql
-- Add AI summary field
ALTER TABLE businesses 
ADD COLUMN ai_summary TEXT;

-- Add index for full-text search (optional)
CREATE INDEX IF NOT EXISTS businesses_ai_summary_idx 
ON businesses USING GIN (to_tsvector('english', ai_summary));
```

**Fields Added:**
- `ai_summary` (TEXT): AI-generated business summary

---

### Migration 2: Add Business Hours
**When:** Implementing business detail page with hours  
**Purpose:** Store business hours of operation

```sql
-- Add hours field (stored as JSONB)
ALTER TABLE businesses 
ADD COLUMN hours JSONB;

-- Example structure:
-- [
--   {
--     "open": [
--       {"day": 0, "start": "0700", "end": "1800", "is_overnight": false},
--       {"day": 1, "start": "0700", "end": "1800", "is_overnight": false}
--     ],
--     "hours_type": "REGULAR",
--     "is_open_now": true
--   }
-- ]
```

**Fields Added:**
- `hours` (JSONB): Business hours from Yelp API or user-entered

---

### Migration 3: Add Multiple Photos
**When:** Implementing photo gallery feature  
**Purpose:** Store multiple photos per business

**Option A: JSONB Array (Simple)**
```sql
-- Add photos array
ALTER TABLE businesses 
ADD COLUMN photos JSONB;

-- Example: ["url1", "url2", "url3"]
-- Or with metadata: [{"url": "url1", "caption": "Interior"}, ...]
```

**Option B: Separate Table (Better for large datasets)**
```sql
-- Create business_photos table
CREATE TABLE business_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX business_photos_business_id_idx ON business_photos(business_id);
```

**Recommendation:** Start with Option A (JSONB), migrate to Option B if needed

---

### Migration 4: Add Business Attributes
**When:** Implementing filter by amenities feature  
**Purpose:** Store business attributes (WiFi, parking, etc.)

```sql
-- Add attributes field
ALTER TABLE businesses 
ADD COLUMN attributes JSONB;

-- Example structure from Yelp API:
-- {
--   "BusinessAcceptsCreditCards": true,
--   "WiFi": "free",
--   "Parking": {"garage": true, "street": true},
--   "OutdoorSeating": true,
--   "WheelchairAccessible": true
-- }

-- Create index for filtering
CREATE INDEX businesses_attributes_idx ON businesses USING GIN (attributes);
```

**Fields Added:**
- `attributes` (JSONB): Business amenities and attributes

---

### Migration 5: User Reviews System
**When:** Implementing user-generated reviews  
**Purpose:** Store user reviews (separate from Yelp reviews)

```sql
-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_avatar TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX reviews_business_id_idx ON reviews(business_id);
CREATE INDEX reviews_user_id_idx ON reviews(user_id);
CREATE INDEX reviews_created_at_idx ON reviews(created_at DESC);

-- Update updated_at trigger
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Tables Created:**
- `reviews`: User-generated reviews

---

### Migration 6: User Favorites
**When:** Implementing favorites feature  
**Purpose:** Allow users to save favorite businesses

```sql
-- Create user_favorites table
CREATE TABLE user_favorites (
  user_id TEXT NOT NULL,
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, business_id)
);

-- Create indexes
CREATE INDEX user_favorites_user_id_idx ON user_favorites(user_id);
CREATE INDEX user_favorites_business_id_idx ON user_favorites(business_id);
```

**Tables Created:**
- `user_favorites`: Junction table for user favorites

---

### Migration 7: Business Owner Claims
**When:** Implementing business owner dashboard  
**Purpose:** Track claimed businesses and owners

```sql
-- Add claim fields to businesses table
ALTER TABLE businesses 
ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN claimed_by TEXT,
ADD COLUMN claimed_at TIMESTAMPTZ;

-- Create business_owners table (optional, for owner profiles)
CREATE TABLE business_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  business_id TEXT REFERENCES businesses(id),
  claim_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX business_owners_user_id_idx ON business_owners(user_id);
CREATE INDEX business_owners_business_id_idx ON business_owners(business_id);
```

**Fields Added:**
- `is_claimed` (BOOLEAN): Whether business is claimed
- `claimed_by` (TEXT): User ID of owner
- `claimed_at` (TIMESTAMPTZ): When business was claimed

**Tables Created:**
- `business_owners`: Owner profiles and verification

---

### Migration 8: User Profiles
**When:** Implementing user profile pages  
**Purpose:** Store user profile information

```sql
-- Create users table (mock for class project)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  email TEXT,
  review_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX users_email_idx ON users(email);

-- Update updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Tables Created:**
- `users`: User profiles (mock for class)

---

## Migration Execution Order

### Phase 1: Wireframe Implementation (Current)
- ✅ No migrations needed - current schema sufficient

### Phase 2: Core Features
1. Migration 1: AI Summary (for AI summary feature)
2. Migration 2: Business Hours (for detail page)
3. Migration 3: Multiple Photos (for photo gallery)

### Phase 3: User Features
4. Migration 8: User Profiles (for user accounts)
5. Migration 5: User Reviews (for review system)
6. Migration 6: User Favorites (for favorites feature)

### Phase 4: Business Owner Features
7. Migration 7: Business Owner Claims (for owner dashboard)
8. Migration 4: Business Attributes (for filtering)

## Running Migrations

### In Supabase Dashboard:
1. Go to SQL Editor
2. Copy migration SQL
3. Paste and run
4. Verify table structure in Table Editor

### Best Practices:
- **Test migrations** on a development database first
- **Backup database** before running migrations
- **Run one migration at a time** and verify
- **Document changes** in this file
- **Version control** migrations in `database/migrations/` folder

## Migration Files Structure

For future migrations, create separate migration files:

```
database/
├── schema.sql          # Initial schema (current)
├── README.md           # Database documentation
├── MIGRATIONS.md       # This file
└── migrations/
    ├── 001_add_ai_summary.sql
    ├── 002_add_hours.sql
    ├── 003_add_photos.sql
    └── ...
```

## Rollback Procedures

If a migration needs to be rolled back:

```sql
-- Example: Rollback AI summary
ALTER TABLE businesses DROP COLUMN IF EXISTS ai_summary;
DROP INDEX IF EXISTS businesses_ai_summary_idx;
```

**Always test rollback procedures** before applying migrations in production.

## Summary

**Current Status:**
- ✅ Schema is sufficient for wireframe phase
- ✅ All essential business data captured
- ✅ Ready for initial UI implementation

**Future Needs:**
- ⏳ AI summary field (when implementing AI feature)
- ⏳ Business hours (when implementing detail page)
- ⏳ Multiple photos (when implementing gallery)
- ⏳ User reviews (when implementing review system)
- ⏳ User favorites (when implementing favorites)
- ⏳ Business claims (when implementing owner dashboard)
- ⏳ Business attributes (when implementing advanced filtering)

