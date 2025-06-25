export interface GeneratedImage {
  id: string
  user_id: string
  prompt: string
  model_used: "gpt-4o" | "gpt-image-1" | "dall-e-2" | "dall-e-3" | "flux-schnell" | "latent-consistency" | "ssd-1b"
  image_url: string
  revised_prompt?: string
  generation_params: {
    size?: string
    quality?: "standard" | "hd"
    style?: "vivid" | "natural"
    seed?: number
    guidance_scale?: number
    prompt_strength?: number
    num_inference_steps?: number
    negative_prompt?: string
    image?: string
  }
  created_at: string
  is_public?: boolean
  likes_count?: number
  views_count?: number
  featured?: boolean
  tags?: string[]
}

export interface Profile {
  id: string
  username?: string
  created_at: string
}

export interface GenerationParams {
  size: string
  quality?: "standard" | "hd"
  style?: "vivid" | "natural"
  seed?: number
  guidance_scale?: number
  prompt_strength?: number
  num_inference_steps?: number
  negative_prompt?: string
  image?: string
  temperature?: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  subject: string
  difficulty_level: "beginner" | "intermediate" | "advanced"
  prompt_template: string
  example_keywords: string[]
  learning_objectives: string[]
  created_at: string
  is_active: boolean
}

export interface ChallengeSubmission {
  id: string
  challenge_id: string
  user_id: string
  prompt_used: string
  model_used: string
  image_url: string
  revised_prompt?: string
  generation_params: GenerationParams
  submitted_at: string
}

// New Challenge System Types
export interface ChallengeReferenceImage {
  id: string
  title: string
  description?: string
  image_url: string
  difficulty_level: "beginner" | "intermediate" | "advanced"
  category: string
  admin_uploaded_by?: string
  is_active: boolean
  created_at: string
}

export interface ImageRecreationAttempt {
  id: string
  user_id: string
  reference_image_id: string
  user_prompt: string
  generated_image_url: string
  model_used: string
  gpt4v_score?: number
  gpt4v_feedback?: string
  improvement_suggestions?: string
  attempt_number: number
  created_at: string
}

export interface LinkedInProfile {
  id: string
  user_id: string
  profile_photo_url?: string
  dream_job: string
  dream_college: string
  current_status?: string
  skills: string[]
  experience: any[]
  education: any[]
  total_points: number
  profile_completion_percentage: number
  created_at: string
  updated_at: string
}

export interface LinkedInTask {
  id: string
  task_number: number
  title: string
  description: string
  category: "profile_optimization" | "networking" | "content_creation" | "skill_building"
  points: number
  bonus_criteria?: string
  bonus_points: number
  is_active: boolean
  created_at: string
}

export interface UserTaskProgress {
  id: string
  user_id: string
  linkedin_profile_id: string
  task_id: string
  is_completed: boolean
  completion_date?: string
  evidence_url?: string
  quality_score?: number
  points_earned: number
  admin_verified: boolean
  created_at: string
}

export interface ChallengeScore {
  id: string
  user_id: string
  challenge_type: "image_recreation" | "linkedin_profile"
  best_score: number
  total_attempts: number
  total_points: number
  achievements: string[]
  last_activity: string
  created_at: string
}
