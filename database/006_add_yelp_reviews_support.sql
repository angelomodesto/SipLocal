-- Migration: Add Yelp review support to reviews table
-- This allows storing both user-generated and Yelp reviews
-- Run this in Supabase SQL Editor

-- First, create the reviews table if it doesn't exist (for initial setup)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  photos JSONB,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns for Yelp reviews
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'yelp')),
ADD COLUMN IF NOT EXISTS yelp_review_id TEXT,
ADD COLUMN IF NOT EXISTS yelp_user_name TEXT,
ADD COLUMN IF NOT EXISTS yelp_user_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS yelp_url TEXT,
ADD COLUMN IF NOT EXISTS yelp_fetched_at TIMESTAMPTZ;

-- Make user_id nullable (Yelp reviews don't have user_id)
ALTER TABLE public.reviews 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing unique constraint if it exists (might have different name)
DO $$ 
BEGIN
  -- Try to drop constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reviews_business_id_user_id_key'
  ) THEN
    ALTER TABLE public.reviews DROP CONSTRAINT reviews_business_id_user_id_key;
  END IF;
END $$;

-- Add unique constraints using indexes (required for partial unique constraints)
-- User reviews: one per user per business
CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_unique_idx 
ON public.reviews(business_id, user_id) 
WHERE user_id IS NOT NULL;

-- Yelp reviews: one per yelp_review_id per business
CREATE UNIQUE INDEX IF NOT EXISTS reviews_yelp_unique_idx 
ON public.reviews(business_id, yelp_review_id) 
WHERE source = 'yelp' AND yelp_review_id IS NOT NULL;

-- Add indexes for Yelp reviews
CREATE INDEX IF NOT EXISTS reviews_source_idx ON public.reviews(source);
CREATE INDEX IF NOT EXISTS reviews_yelp_review_id_idx ON public.reviews(yelp_review_id);
CREATE INDEX IF NOT EXISTS reviews_yelp_fetched_at_idx ON public.reviews(yelp_fetched_at);

-- Index for filtering Yelp reviews by fetch time (for querying expired reviews)
-- Note: We can't use NOW() in index predicate (not immutable), so we'll filter in queries
CREATE INDEX IF NOT EXISTS reviews_yelp_fetched_at_idx 
ON public.reviews(yelp_fetched_at) 
WHERE source = 'yelp';

-- Add existing indexes if they don't exist
CREATE INDEX IF NOT EXISTS reviews_business_id_idx ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating);

-- Add updated_at trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

-- Anyone can read reviews (public visibility)
CREATE POLICY "Anyone can read reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

-- Authenticated users can create user reviews
CREATE POLICY "Users can create reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND source = 'user' 
    AND user_id = auth.uid()
  );

-- Users can only update their own user reviews
CREATE POLICY "Users can update own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (
    source = 'user' 
    AND user_id = auth.uid()
  );

-- Users can only delete their own user reviews
CREATE POLICY "Users can delete own reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (
    source = 'user' 
    AND user_id = auth.uid()
  );

-- Note: Yelp reviews (source = 'yelp') are managed by system/admin only
-- They should be inserted/updated via service role or API with proper authentication

