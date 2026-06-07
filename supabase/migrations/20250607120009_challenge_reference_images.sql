-- Image Recreation challenge (Exercise 2) tables.
-- The ImageRecreationChallenge component reads `challenge_reference_images`
-- and writes `image_recreation_attempts`, but no earlier script/migration
-- created them. Without these tables the reference-image fetch throws and the
-- gallery renders empty ("nothing works"). Define them here.

-- Reference images the user picks from and tries to recreate.
CREATE TABLE IF NOT EXISTS challenge_reference_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-user recreation attempts + GPT-4V scoring.
CREATE TABLE IF NOT EXISTS image_recreation_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reference_image_id UUID REFERENCES challenge_reference_images(id),
  user_prompt TEXT NOT NULL,
  generated_image_url TEXT,
  model_used TEXT,
  gpt4v_score NUMERIC,
  gpt4v_feedback TEXT,
  improvement_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE challenge_reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_recreation_attempts ENABLE ROW LEVEL SECURITY;

-- Reference images are public read (the picker loads them before/without auth).
DROP POLICY IF EXISTS "Anyone can view active reference images" ON challenge_reference_images;
CREATE POLICY "Anyone can view active reference images" ON challenge_reference_images
  FOR SELECT USING (is_active = true);

-- Attempts are private to the user who made them.
DROP POLICY IF EXISTS "Users can view own recreation attempts" ON image_recreation_attempts;
CREATE POLICY "Users can view own recreation attempts" ON image_recreation_attempts
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own recreation attempts" ON image_recreation_attempts;
CREATE POLICY "Users can insert own recreation attempts" ON image_recreation_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recreation_attempts_user
  ON image_recreation_attempts(user_id, created_at DESC);
