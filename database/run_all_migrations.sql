-- Run all migrations in order
-- Copy and paste this entire file into Supabase SQL Editor and run it

-- Migration 001: Add photos column
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS photos JSONB;

-- Migration 003: Add ai_summary column
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

