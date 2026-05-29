-- Fix Missing Database Schema Issues
-- Run this script in your Supabase SQL Editor to ensure all required tables and columns exist

-- Ensure profiles table exists with all required columns
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure generated_images table exists with all required columns
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt TEXT NOT NULL,
  model_used TEXT NOT NULL,
  image_url TEXT NOT NULL,
  revised_prompt TEXT,
  generation_params JSONB,
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create essential policies for public image viewing
DROP POLICY IF EXISTS "Anyone can view public images" ON generated_images;
CREATE POLICY "Anyone can view public images" ON generated_images 
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own images" ON generated_images;
CREATE POLICY "Users can view own images" ON generated_images 
  FOR SELECT USING (auth.uid() = user_id);

-- Allow anonymous users to view public images (needed for home page)
DROP POLICY IF EXISTS "Anonymous can view public images" ON generated_images;
CREATE POLICY "Anonymous can view public images" ON generated_images 
  FOR SELECT TO anon USING (is_public = true);

-- Allow viewing of profiles for public images
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles" ON profiles 
  FOR SELECT USING (true);

-- Create some sample data if no public images exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM generated_images WHERE is_public = true LIMIT 1) THEN
    -- Create a sample profile
    INSERT INTO profiles (id, username, display_name, bio)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'sample_artist',
      'AI Art Pioneer',
      'Exploring AI creativity'
    ) ON CONFLICT (id) DO NOTHING;

    -- Create sample public images with placeholder images
    INSERT INTO generated_images (
      user_id, prompt, model_used, image_url, is_public, likes_count, views_count
    ) VALUES 
    (
      '00000000-0000-0000-0000-000000000001',
      'Beautiful mountain landscape with autumn colors',
      'DALLE-3',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      true, 25, 150
    ),
    (
      '00000000-0000-0000-0000-000000000001',
      'Abstract digital art with vibrant colors',
      'FLUX-Schnell',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
      true, 18, 95
    ),
    (
      '00000000-0000-0000-0000-000000000001',
      'Modern architecture with clean lines',
      'GPT-4O',
      'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=600&fit=crop',
      true, 32, 178
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT ON profiles TO anon, authenticated;
GRANT SELECT ON generated_images TO anon, authenticated;

-- Verification query - run this to check if everything is working
SELECT 
  gi.id,
  gi.prompt,
  gi.model_used,
  gi.is_public,
  p.display_name,
  p.username
FROM generated_images gi
LEFT JOIN profiles p ON gi.user_id = p.id
WHERE gi.is_public = true
LIMIT 5; 