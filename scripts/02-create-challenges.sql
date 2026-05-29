-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  prompt_template TEXT NOT NULL,
  example_keywords TEXT[],
  learning_objectives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create challenge submissions table
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt_used TEXT NOT NULL,
  model_used TEXT NOT NULL,
  image_url TEXT NOT NULL,
  revised_prompt TEXT,
  generation_params JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id, model_used)
);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges (public read)
CREATE POLICY "Anyone can view active challenges" ON challenges 
  FOR SELECT USING (is_active = true);

-- RLS Policies for challenge_submissions
CREATE POLICY "Users can view own submissions" ON challenge_submissions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON challenge_submissions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submissions" ON challenge_submissions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample challenges
INSERT INTO challenges (title, description, subject, difficulty_level, prompt_template, example_keywords, learning_objectives) VALUES
('Ancient Civilizations', 'Create images depicting life in ancient civilizations', 'History', 'beginner', 'A detailed scene showing daily life in ancient {civilization}, featuring {activity} with historically accurate {elements}', ARRAY['Egypt', 'Rome', 'Greece', 'pyramids', 'colosseum', 'marketplace', 'clothing', 'architecture'], ARRAY['Understanding historical contexts', 'Visual representation of ancient cultures', 'Attention to historical accuracy']),

('Ecosystem Exploration', 'Generate images of different ecosystems and their inhabitants', 'Science', 'beginner', 'A vibrant {ecosystem} showing the interaction between {organisms} and their {environment}', ARRAY['rainforest', 'desert', 'ocean', 'tundra', 'animals', 'plants', 'food chain', 'biodiversity'], ARRAY['Understanding ecological relationships', 'Biodiversity awareness', 'Environmental science concepts']),

('Mathematical Concepts Visualization', 'Visualize abstract mathematical concepts through imagery', 'Mathematics', 'intermediate', 'A creative visualization of {mathematical_concept} using {visual_metaphor} to help explain {specific_aspect}', ARRAY['fractals', 'geometry', 'calculus', 'statistics', 'golden ratio', 'infinity', 'patterns', 'symmetry'], ARRAY['Abstract thinking', 'Mathematical visualization', 'Conceptual understanding']),

('Literary Scene Recreation', 'Bring famous literary scenes to life through AI imagery', 'Literature', 'intermediate', 'A dramatic scene from {literary_work} showing {character} during {key_moment}, capturing the {mood} and {setting}', ARRAY['Shakespeare', 'Dickens', 'Tolkien', 'castle', 'forest', 'dramatic', 'romantic', 'mysterious'], ARRAY['Literary analysis', 'Character interpretation', 'Setting visualization']),

('Scientific Innovation', 'Imagine future scientific breakthroughs and technologies', 'Science', 'advanced', 'A futuristic laboratory where scientists are working on {breakthrough_technology} to solve {global_challenge}, showing {innovative_solution}', ARRAY['renewable energy', 'space exploration', 'medicine', 'AI', 'biotechnology', 'climate change', 'sustainability'], ARRAY['Future thinking', 'Problem-solving', 'Scientific innovation']),

('Cultural Celebrations', 'Explore world cultures through their celebrations and traditions', 'Social Studies', 'beginner', 'A vibrant celebration of {cultural_festival} showing people in traditional {cultural_elements} participating in {activities}', ARRAY['Diwali', 'Chinese New Year', 'Carnival', 'Oktoberfest', 'costumes', 'food', 'music', 'dance', 'decorations'], ARRAY['Cultural awareness', 'Global citizenship', 'Diversity appreciation']),

('Architectural Marvels', 'Design and visualize architectural wonders from different eras', 'Art & Architecture', 'advanced', 'An innovative {architectural_style} building that combines {historical_elements} with {modern_features} for {specific_purpose}', ARRAY['Gothic', 'Bauhaus', 'Art Deco', 'sustainable', 'smart city', 'cultural center', 'museum', 'library'], ARRAY['Architectural history', 'Design principles', 'Cultural significance']),

('Climate and Weather', 'Visualize weather phenomena and climate patterns', 'Geography', 'intermediate', 'A dramatic weather event showing {weather_phenomenon} affecting a {landscape_type} with visible {environmental_impact}', ARRAY['tornado', 'aurora', 'monsoon', 'drought', 'glacier', 'desert', 'coastal', 'mountain', 'erosion'], ARRAY['Weather systems understanding', 'Climate change awareness', 'Geographic processes']);
