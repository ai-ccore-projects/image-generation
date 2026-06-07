-- Auto-create a public.profiles row for every new auth user.
-- signUp() (contexts/auth-context.tsx) only writes username/display_name/bio into
-- auth.users.raw_user_meta_data and never inserts into profiles, and no trigger
-- existed to do it. Result: real users had no profiles row, so the User Profile
-- modal's `.eq('id', user.id).single()` threw PGRST116 ("no rows") and showed
-- "Failed to load profile". This creates the missing trigger + backfills.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'AI art enthusiast and digital creator')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: any existing auth user missing a profile gets one now.
INSERT INTO public.profiles (id, username, display_name, bio)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'display_name', 'New User'),
  COALESCE(u.raw_user_meta_data->>'bio', 'AI art enthusiast and digital creator')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
