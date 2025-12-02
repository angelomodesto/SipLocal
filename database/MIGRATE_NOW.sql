-- URGENT: Run this in Supabase SQL Editor to fix the "photos column not found" error
-- Copy and paste this entire file into Supabase SQL Editor

-- Add photos column (required for image gallery)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS photos JSONB;

-- Add ai_summary column (placeholder for future feature)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('photos', 'ai_summary');

