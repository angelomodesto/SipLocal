-- Migration: Add ai_summary column for AI-generated business summaries
-- This is a placeholder for future AI feature implementation

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Add index if we'll search by summary content in the future
-- CREATE INDEX IF NOT EXISTS businesses_ai_summary_idx ON businesses USING GIN (to_tsvector('english', ai_summary));

