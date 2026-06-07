-- Seed / sample data for local development (from scripts/07-add-sample-gallery-data.sql)
-- Runs automatically on `supabase start` and `supabase db reset`.

-- The sample rows below reference user 00000000-0000-0000-0000-000000000001.
-- generated_images.user_id and profiles.id both have FKs to auth.users, so we
-- must create that auth user first (display-only; not intended for login).
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, recovery_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated',
  'sample_artist@example.com',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"sample_artist","display_name":"AI Art Pioneer"}',
  now(), now(),
  '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Sample profile
INSERT INTO profiles (id, username, display_name, bio)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'sample_artist',
  'AI Art Pioneer',
  'Exploring the frontiers of AI-generated creativity'
) ON CONFLICT (id) DO NOTHING;

-- Sample public images
INSERT INTO generated_images (
  id, user_id, prompt, model_used, image_url, revised_prompt,
  is_public, likes_count, views_count, tags, created_at
) VALUES
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Serene mountain landscape with autumn colors',
  'DALLE-3',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'A breathtaking mountain landscape during autumn season, featuring majestic peaks reflected in crystal clear lake water with vibrant fall foliage',
  true, 42, 156,
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
  true, 28, 89,
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
  true, 67, 203,
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
  true, 34, 112,
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
  true, 51, 167,
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
  true, 19, 78,
  ARRAY['graduation', 'university', 'celebration', 'achievement'],
  NOW() - INTERVAL '8 hours'
);

-- Sample likes
INSERT INTO image_likes (image_id, user_id)
SELECT gi.id, '00000000-0000-0000-0000-000000000001'
FROM generated_images gi
WHERE gi.is_public = true
LIMIT 3
ON CONFLICT (image_id, user_id) DO NOTHING;

-- Sample views
INSERT INTO image_views (image_id, user_id)
SELECT gi.id, '00000000-0000-0000-0000-000000000001'
FROM generated_images gi
WHERE gi.is_public = true
ON CONFLICT (image_id, user_id) DO NOTHING;

-- Reference images for the Image Recreation challenge (Exercise 2).
-- Without these the reference-image picker is empty and the challenge is unusable.
INSERT INTO challenge_reference_images (title, description, image_url, difficulty_level, category)
VALUES
  ('Autumn Mountain Lake',
   'A serene mountain landscape at golden hour with autumn foliage reflected in a calm lake, soft natural lighting and misty atmosphere.',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
   'beginner', 'landscape'),
  ('Vibrant Abstract Flow',
   'Dynamic abstract artwork with flowing shapes and bold color gradients in blues, oranges, and purples, expressionist style.',
   'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
   'beginner', 'abstract'),
  ('Studio Portrait',
   'Professional portrait with soft studio lighting, gentle shadows, and detailed facial features in a photorealistic style.',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face',
   'intermediate', 'portrait'),
  ('Misty Forest Path',
   'A quiet forest path shrouded in morning mist with diffuse light filtering through tall trees, muted earthy tones.',
   'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
   'intermediate', 'landscape'),
  ('Neon City Night',
   'A rain-soaked city street at night lit by vivid neon signs, reflective puddles, cinematic cyberpunk mood.',
   'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=800&h=600&fit=crop',
   'advanced', 'landscape'),
  ('Golden Hour Desert',
   'Rolling sand dunes under a warm golden-hour sky with long dramatic shadows and rich amber tones.',
   'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop',
   'advanced', 'landscape')
ON CONFLICT DO NOTHING;
