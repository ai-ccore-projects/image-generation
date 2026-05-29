-- =====================================================
-- PROMPT GENERATOR TABLES AND STORAGE SETUP
-- =====================================================

-- Enable RLS (Row Level Security)
-- This script creates tables for prompt generator functionality

-- 1. CREATE PROMPTS TABLE
-- Stores user prompts and AI-enhanced versions
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Prompt',
    form_data JSONB NOT NULL, -- Stores the complete form responses
    original_prompt TEXT NOT NULL, -- User's original prompt
    enhanced_prompt TEXT, -- AI-enhanced version
    enhancement_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    content_moderated BOOLEAN DEFAULT false,
    moderation_flags JSONB, -- Store any moderation issues
    is_public BOOLEAN DEFAULT false, -- Allow sharing
    tags TEXT[], -- For categorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE PORTFOLIO_UPLOADS TABLE
-- Stores portfolio website submissions with screenshots
CREATE TABLE IF NOT EXISTS public.portfolio_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    website_url VARCHAR(500) NOT NULL,
    screenshot_urls TEXT[], -- Array of image URLs (max 4)
    screenshot_count INTEGER DEFAULT 0 CHECK (screenshot_count <= 4),
    tags TEXT[], -- For categorization
    is_public BOOLEAN DEFAULT false, -- Allow in public gallery
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE PROMPT_LIKES TABLE
-- Track user likes for prompts and portfolios
CREATE TABLE IF NOT EXISTS public.prompt_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES public.portfolio_uploads(id) ON DELETE CASCADE,
    like_type VARCHAR(20) NOT NULL CHECK (like_type IN ('prompt', 'portfolio')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prompt_id, like_type),
    UNIQUE(user_id, portfolio_id, like_type)
);

-- 4. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON public.prompts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON public.prompts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_portfolio_uploads_user_id ON public.portfolio_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_uploads_prompt_id ON public.portfolio_uploads(prompt_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_uploads_created_at ON public.portfolio_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_uploads_is_public ON public.portfolio_uploads(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_uploads_tags ON public.portfolio_uploads USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_prompt_likes_user_id ON public.prompt_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_likes_prompt_id ON public.prompt_likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_likes_portfolio_id ON public.prompt_likes(portfolio_id);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_likes ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES

-- PROMPTS TABLE POLICIES
-- Users can view their own prompts and public prompts
CREATE POLICY "Users can view own prompts" ON public.prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public prompts" ON public.prompts
    FOR SELECT USING (is_public = true);

-- Users can insert their own prompts
CREATE POLICY "Users can insert own prompts" ON public.prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own prompts
CREATE POLICY "Users can update own prompts" ON public.prompts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own prompts
CREATE POLICY "Users can delete own prompts" ON public.prompts
    FOR DELETE USING (auth.uid() = user_id);

-- PORTFOLIO_UPLOADS TABLE POLICIES
-- Users can view their own uploads and public uploads
CREATE POLICY "Users can view own portfolio uploads" ON public.portfolio_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public portfolio uploads" ON public.portfolio_uploads
    FOR SELECT USING (is_public = true);

-- Users can insert their own uploads
CREATE POLICY "Users can insert own portfolio uploads" ON public.portfolio_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own uploads
CREATE POLICY "Users can update own portfolio uploads" ON public.portfolio_uploads
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own portfolio uploads" ON public.portfolio_uploads
    FOR DELETE USING (auth.uid() = user_id);

-- PROMPT_LIKES TABLE POLICIES
-- Users can view all likes (for counting)
CREATE POLICY "Users can view likes" ON public.prompt_likes
    FOR SELECT USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can insert own likes" ON public.prompt_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes" ON public.prompt_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 7. CREATE STORAGE BUCKET FOR PORTFOLIO SCREENSHOTS
-- Note: This should be run in Supabase dashboard or via API
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-screenshots', 'portfolio-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- 8. CREATE STORAGE POLICIES FOR PORTFOLIO SCREENSHOTS
-- Allow authenticated users to upload portfolio screenshots
CREATE POLICY "Authenticated users can upload portfolio screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-screenshots');

-- Allow users to view all portfolio screenshots (public bucket)
CREATE POLICY "Anyone can view portfolio screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-screenshots');

-- Allow users to delete their own portfolio screenshots
CREATE POLICY "Users can delete own portfolio screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 9. CREATE HELPFUL FUNCTIONS

-- Function to get user's prompt statistics
CREATE OR REPLACE FUNCTION public.get_user_prompt_stats(user_uuid UUID)
RETURNS TABLE (
    total_prompts BIGINT,
    enhanced_prompts BIGINT,
    public_prompts BIGINT,
    total_portfolios BIGINT,
    public_portfolios BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.prompts WHERE user_id = user_uuid) as total_prompts,
        (SELECT COUNT(*) FROM public.prompts WHERE user_id = user_uuid AND enhanced_prompt IS NOT NULL) as enhanced_prompts,
        (SELECT COUNT(*) FROM public.prompts WHERE user_id = user_uuid AND is_public = true) as public_prompts,
        (SELECT COUNT(*) FROM public.portfolio_uploads WHERE user_id = user_uuid) as total_portfolios,
        (SELECT COUNT(*) FROM public.portfolio_uploads WHERE user_id = user_uuid AND is_public = true) as public_portfolios;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_portfolio_view_count(portfolio_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.portfolio_uploads 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = portfolio_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending portfolios
CREATE OR REPLACE FUNCTION public.get_trending_portfolios(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    website_url VARCHAR(500),
    screenshot_urls TEXT[],
    view_count INTEGER,
    like_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.website_url,
        p.screenshot_urls,
        p.view_count,
        p.like_count,
        p.created_at
    FROM public.portfolio_uploads p
    WHERE p.is_public = true
    ORDER BY (p.view_count + p.like_count * 2) DESC, p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CREATE TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_uploads_updated_at
    BEFORE UPDATE ON public.portfolio_uploads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Summary of created resources:
-- Tables: prompts, portfolio_uploads, prompt_likes
-- Storage: portfolio-screenshots bucket
-- Functions: get_user_prompt_stats, increment_portfolio_view_count, get_trending_portfolios
-- Policies: RLS policies for all tables and storage
-- Indexes: Performance indexes for common queries 