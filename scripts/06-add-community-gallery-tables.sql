-- Add Community Gallery Tables and Columns
-- This script adds the missing database structure for community gallery features

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add missing columns to generated_images table
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create image_likes table
CREATE TABLE IF NOT EXISTS image_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID REFERENCES generated_images(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(image_id, user_id)
);

-- Create image_views table
CREATE TABLE IF NOT EXISTS image_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID REFERENCES generated_images(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(image_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE image_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_views ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for image_likes
CREATE POLICY "Users can view all likes" ON image_likes 
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON image_likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON image_likes 
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for image_views
CREATE POLICY "Users can view all views" ON image_views 
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own views" ON image_views 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own views" ON image_views 
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Update RLS policies for generated_images to allow public viewing
CREATE POLICY "Anyone can view public images" ON generated_images 
  FOR SELECT USING (is_public = true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_images_public ON generated_images(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_likes_count ON generated_images(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_trending ON generated_images(is_public, created_at DESC, likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_image_likes_image_id ON image_likes(image_id);
CREATE INDEX IF NOT EXISTS idx_image_likes_user_id ON image_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_image_views_image_id ON image_views(image_id);
CREATE INDEX IF NOT EXISTS idx_image_views_user_id ON image_views(user_id); 