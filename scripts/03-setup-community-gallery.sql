-- Setup Community Gallery Sample Data
-- This script adds sample images and profiles for testing the community gallery

-- Update some existing generated images to be public (if any exist)
UPDATE generated_images 
SET is_public = true, 
    likes_count = floor(random() * 50 + 5)::int,
    views_count = floor(random() * 200 + 20)::int,
    tags = ARRAY['ai-art', 'creative', 'stunning']
WHERE id IN (
  SELECT id FROM generated_images 
  ORDER BY created_at DESC 
  LIMIT 5
);

-- Update some profiles with display names
UPDATE profiles 
SET display_name = CASE 
  WHEN username IS NOT NULL THEN initcap(username) || ' Artist'
  ELSE 'Anonymous Artist'
END
WHERE display_name IS NULL;

-- Create some sample profile entries for users who don't have them
INSERT INTO profiles (id, username, display_name, bio)
SELECT 
  u.id,
  'user_' || substring(u.id::text, 1, 8),
  'Creative Artist ' || substring(u.id::text, 1, 4),
  'AI art enthusiast and digital creator'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
LIMIT 3;

-- Grant necessary permissions for the community gallery functions
GRANT EXECUTE ON FUNCTION get_public_gallery_images TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_images TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_image_like TO authenticated;
GRANT EXECUTE ON FUNCTION record_image_view TO authenticated; 