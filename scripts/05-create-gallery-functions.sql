-- Community Gallery RPC Functions
-- This script creates the required database functions for the community gallery

-- Function to get public gallery images with filtering and pagination
CREATE OR REPLACE FUNCTION get_public_gallery_images(
  limit_count INT DEFAULT 20,
  offset_count INT DEFAULT 0,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc'
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  prompt TEXT,
  revised_prompt TEXT,
  model_used TEXT,
  likes_count INT,
  views_count INT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  user_id UUID,
  display_name TEXT,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  EXECUTE format('
    SELECT 
      gi.id,
      gi.image_url,
      gi.prompt,
      gi.revised_prompt,
      gi.model_used,
      COALESCE(gi.likes_count, 0) as likes_count,
      COALESCE(gi.views_count, 0) as views_count,
      COALESCE(gi.tags, ARRAY[]::TEXT[]) as tags,
      gi.created_at,
      gi.user_id,
      COALESCE(p.display_name, p.username, ''Anonymous'') as display_name,
      p.username
    FROM generated_images gi
    LEFT JOIN profiles p ON gi.user_id = p.id
    WHERE gi.is_public = true
    ORDER BY %I %s
    LIMIT %L OFFSET %L
  ', sort_by, sort_order, limit_count, offset_count);
END;
$$;

-- Function to get trending images (most liked in recent period)
CREATE OR REPLACE FUNCTION get_trending_images(
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  prompt TEXT,
  revised_prompt TEXT,
  model_used TEXT,
  likes_count INT,
  views_count INT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  user_id UUID,
  display_name TEXT,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gi.id,
    gi.image_url,
    gi.prompt,
    gi.revised_prompt,
    gi.model_used,
    COALESCE(gi.likes_count, 0) as likes_count,
    COALESCE(gi.views_count, 0) as views_count,
    COALESCE(gi.tags, ARRAY[]::TEXT[]) as tags,
    gi.created_at,
    gi.user_id,
    COALESCE(p.display_name, p.username, 'Anonymous') as display_name,
    p.username
  FROM generated_images gi
  LEFT JOIN profiles p ON gi.user_id = p.id
  WHERE gi.is_public = true
    AND gi.created_at > NOW() - INTERVAL '7 days'
  ORDER BY 
    (COALESCE(gi.likes_count, 0) * 0.7 + COALESCE(gi.views_count, 0) * 0.3) DESC,
    gi.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to toggle like on an image
CREATE OR REPLACE FUNCTION toggle_image_like(
  image_id UUID,
  user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  new_likes_count INT,
  is_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_like_id UUID;
  current_likes_count INT;
BEGIN
  -- Check if user already liked this image
  SELECT id INTO existing_like_id
  FROM image_likes 
  WHERE image_id = toggle_image_like.image_id 
    AND user_id = toggle_image_like.user_id;

  IF existing_like_id IS NOT NULL THEN
    -- Unlike: Remove the like
    DELETE FROM image_likes WHERE id = existing_like_id;
    
    -- Update likes count
    UPDATE generated_images 
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = image_id
    RETURNING COALESCE(likes_count, 0) INTO current_likes_count;
    
    RETURN QUERY SELECT true, current_likes_count, false;
  ELSE
    -- Like: Add the like
    INSERT INTO image_likes (image_id, user_id) 
    VALUES (toggle_image_like.image_id, toggle_image_like.user_id);
    
    -- Update likes count
    UPDATE generated_images 
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = image_id
    RETURNING COALESCE(likes_count, 0) INTO current_likes_count;
    
    RETURN QUERY SELECT true, current_likes_count, true;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, 0, false;
END;
$$;

-- Function to record image view
CREATE OR REPLACE FUNCTION record_image_view(
  image_id UUID,
  user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Record the view
  INSERT INTO image_views (image_id, user_id, viewed_at)
  VALUES (image_id, user_id, NOW())
  ON CONFLICT (image_id, user_id) DO UPDATE SET viewed_at = NOW();
  
  -- Update view count
  UPDATE generated_images 
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = image_id;
  
  RETURN true;
  
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_public_gallery_images TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_trending_images TO authenticated, anon;
GRANT EXECUTE ON FUNCTION toggle_image_like TO authenticated;
GRANT EXECUTE ON FUNCTION record_image_view TO authenticated, anon; 