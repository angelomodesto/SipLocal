-- Create user_pins table for Pinterest-like pin board feature
-- Users can pin businesses and add their own photos

CREATE TABLE IF NOT EXISTS public.user_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'want_to_try', -- 'favorite' or 'want_to_try'
  user_notes TEXT, -- Optional notes from the user
  user_image_url TEXT, -- URL to user-uploaded image in Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_id) -- Prevent duplicate pins
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own pins
CREATE POLICY "Users can view own pins" 
  ON public.user_pins 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own pins
CREATE POLICY "Users can insert own pins" 
  ON public.user_pins 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own pins
CREATE POLICY "Users can update own pins" 
  ON public.user_pins 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own pins
CREATE POLICY "Users can delete own pins" 
  ON public.user_pins 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS user_pins_user_id_idx ON public.user_pins(user_id);
CREATE INDEX IF NOT EXISTS user_pins_business_id_idx ON public.user_pins(business_id);
CREATE INDEX IF NOT EXISTS user_pins_status_idx ON public.user_pins(status);
CREATE INDEX IF NOT EXISTS user_pins_created_at_idx ON public.user_pins(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_user_pins_updated_at
  BEFORE UPDATE ON public.user_pins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

