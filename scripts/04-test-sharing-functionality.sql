-- Test Sharing Functionality
-- This script tests the RLS policies and sharing features

-- Test 1: Verify RLS policies exist
SELECT 'Testing RLS Policies...' as test_name;

SELECT 
  COUNT(*) as policy_count,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
  COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies 
WHERE tablename = 'generated_images';

-- Test 2: Verify new columns exist
SELECT 'Testing New Columns...' as test_name;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'generated_images' 
  AND column_name IN ('is_public', 'likes_count', 'views_count', 'featured', 'tags')
ORDER BY column_name;

-- Test 3: Verify helper tables exist
SELECT 'Testing Helper Tables...' as test_name;

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('image_likes', 'image_views', 'profiles')
  AND table_schema = 'public'
ORDER BY table_name;

-- Test 4: Verify functions exist
SELECT 'Testing Functions...' as test_name;

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN (
  'get_public_gallery_images',
  'get_trending_images', 
  'toggle_image_like',
  'record_image_view'
)
ORDER BY routine_name;

-- Test 5: Show current sharing status
SELECT 'Current Sharing Status...' as test_name;

SELECT 
  COUNT(*) as total_images,
  COUNT(CASE WHEN is_public = true THEN 1 END) as public_images,
  COUNT(CASE WHEN is_public = false OR is_public IS NULL THEN 1 END) as private_images,
  AVG(likes_count) as avg_likes,
  AVG(views_count) as avg_views
FROM generated_images; 