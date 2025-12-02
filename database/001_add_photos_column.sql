-- Migration: Add photos array column for multiple business images
-- This supports the business detail page image gallery feature

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS photos JSONB;

-- Add index for photos JSONB queries if needed in the future
-- CREATE INDEX IF NOT EXISTS businesses_photos_idx ON businesses USING GIN (photos);

