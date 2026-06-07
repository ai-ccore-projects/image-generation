-- Create storage buckets that the app expects but that no SQL script creates.
-- On Supabase Cloud these were created via the dashboard; locally we create them here.
-- Buckets are public because the app reads files via getPublicUrl().

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('generated-images', 'generated-images', true),
  ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- generated-images: uploaded server-side with the service role (which bypasses RLS).
-- These policies cover any client-side access, scoped to the user's own folder.
CREATE POLICY "Anyone can view generated images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-images');

CREATE POLICY "Users can upload own generated images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own generated images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);
