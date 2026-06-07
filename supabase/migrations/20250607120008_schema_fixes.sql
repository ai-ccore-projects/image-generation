-- Additive policy/grant fixes (from scripts/99-fix-missing-schema.sql)
-- Sample data from this script is handled in supabase/seed.sql instead.

-- Allow anyone (incl. anonymous) to view public images and all profiles,
-- which the home page and community gallery rely on.
DROP POLICY IF EXISTS "Anyone can view public images" ON generated_images;
CREATE POLICY "Anyone can view public images" ON generated_images
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own images" ON generated_images;
CREATE POLICY "Users can view own images" ON generated_images
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous can view public images" ON generated_images;
CREATE POLICY "Anonymous can view public images" ON generated_images
  FOR SELECT TO anon USING (is_public = true);

DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

GRANT SELECT ON profiles TO anon, authenticated;
GRANT SELECT ON generated_images TO anon, authenticated;
