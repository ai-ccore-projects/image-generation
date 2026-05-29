-- Add Sample Gallery Data
-- This script adds sample public images to populate the community gallery

-- First, let's create a sample user profile if it doesn't exist
INSERT INTO profiles (id, username, display_name, bio)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'sample_artist',
  'AI Art Pioneer',
  'Exploring the frontiers of AI-generated creativity'
) ON CONFLICT (id) DO NOTHING;

-- Add sample public images
INSERT INTO generated_images (
  id,
  user_id,
  prompt,
  model_used,
  image_url,
  revised_prompt,
  is_public,
  likes_count,
  views_count,
  tags,
  created_at
) VALUES 
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Serene mountain landscape with autumn colors',
  'DALLE-3',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'A breathtaking mountain landscape during autumn season, featuring majestic peaks reflected in crystal clear lake water with vibrant fall foliage',
  true,
  42,
  156,
  ARRAY['landscape', 'mountains', 'autumn', 'nature'],
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Professional headshot with studio lighting',
  'professional-headshot',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
  'Professional business headshot with studio lighting, crisp details, and modern aesthetic',
  true,
  28,
  89,
  ARRAY['professional', 'headshot', 'business', 'portrait'],
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Fantasy landscape with magical elements',
  'FLUX-Schnell',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Enchanting fantasy landscape featuring mystical forests, floating islands, and magical aurora lighting',
  true,
  67,
  203,
  ARRAY['fantasy', 'landscape', 'magical', 'mystical'],
  NOW() - INTERVAL '3 hours'
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Abstract art with vibrant colors',
  'flux-kontext-pro',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
  'Dynamic abstract artwork featuring flowing shapes and vibrant color gradients in blues, oranges, and purples',
  true,
  34,
  112,
  ARRAY['abstract', 'colorful', 'artistic', 'vibrant'],
  NOW() - INTERVAL '6 hours'
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Luxury car in elegant setting',
  'multi-image-kontext',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
  'Sleek luxury sports car photographed in an elegant modern setting with dramatic lighting',
  true,
  51,
  167,
  ARRAY['luxury', 'car', 'automotive', 'elegant'],
  NOW() - INTERVAL '4 hours'
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Graduation celebration at university',
  'multi-image-kontext',
  'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=600&fit=crop',
  'Joyful graduation celebration scene at a prestigious university campus with traditional architecture',
  true,
  19,
  78,
  ARRAY['graduation', 'university', 'celebration', 'achievement'],
  NOW() - INTERVAL '8 hours'
);

-- Add some sample likes for the images
INSERT INTO image_likes (image_id, user_id)
SELECT 
  gi.id,
  '00000000-0000-0000-0000-000000000001'
FROM generated_images gi
WHERE gi.is_public = true
LIMIT 3
ON CONFLICT (image_id, user_id) DO NOTHING;

-- Add some sample views
INSERT INTO image_views (image_id, user_id)
SELECT 
  gi.id,
  '00000000-0000-0000-0000-000000000001'
FROM generated_images gi
WHERE gi.is_public = true
ON CONFLICT (image_id, user_id) DO NOTHING; 