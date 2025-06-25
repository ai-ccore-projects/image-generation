"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { MODEL_CONFIGS } from "@/lib/ai-models"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Image, 
  Upload, 
  Wand2, 
  Eye, 
  Trophy, 
  RotateCcw, 
  Target,
  Star,
  TrendingUp,
  Camera,
  Save,
  CheckCircle,
  X,
  User
} from "lucide-react"

interface ReferenceImage {
  id: string
  title: string
  description: string
  image_url: string
  difficulty_level: string
  category: string
}

interface AttemptResult {
  score: number
  feedback: string
  suggestions: string
  generated_image_url: string
  strengths?: string
  areas_for_improvement?: string
  helpful_keywords?: string[]
  suggested_prompt?: string
  raw_analysis?: string
  parsing_error?: string
}

export function ImageRecreationChallenge() {
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])
  const [selectedImage, setSelectedImage] = useState<ReferenceImage | null>(null)
  const [userPrompt, setUserPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("dall-e-3")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState("")
  const [comparisonResult, setComparisonResult] = useState<AttemptResult | null>(null)
  const [userAttempts, setUserAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedImageId, setSavedImageId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImageType, setModalImageType] = useState<'reference' | 'generated'>('generated')
  const { user } = useAuth()

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal()
      }
    }

    if (modalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [modalOpen])

  const openModal = (type: 'reference' | 'generated') => {
    setModalImageType(type)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  useEffect(() => {
    fetchReferenceImages()
    if (user) {
      fetchUserAttempts()
    }
  }, [user])

  // Persistence: Load saved state on component mount
  useEffect(() => {
    const savedSelectedImage = localStorage.getItem('aiccore-challenge-selected-image')
    const savedUserPrompt = localStorage.getItem('aiccore-challenge-user-prompt')
    const savedSelectedModel = localStorage.getItem('aiccore-challenge-selected-model')
    const savedGeneratedImageUrl = localStorage.getItem('aiccore-challenge-generated-image')
    const savedComparisonResult = localStorage.getItem('aiccore-challenge-comparison-result')

    if (savedSelectedImage) {
      try {
        setSelectedImage(JSON.parse(savedSelectedImage))
      } catch (e) {
        
      }
    }
    if (savedUserPrompt) setUserPrompt(savedUserPrompt)
    if (savedSelectedModel) setSelectedModel(savedSelectedModel)
    if (savedGeneratedImageUrl) setGeneratedImageUrl(savedGeneratedImageUrl)
    if (savedComparisonResult) {
      try {
        setComparisonResult(JSON.parse(savedComparisonResult))
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (selectedImage) {
      localStorage.setItem('aiccore-challenge-selected-image', JSON.stringify(selectedImage))
    }
  }, [selectedImage])

  useEffect(() => {
    if (userPrompt) {
      localStorage.setItem('aiccore-challenge-user-prompt', userPrompt)
    }
  }, [userPrompt])

  useEffect(() => {
    localStorage.setItem('aiccore-challenge-selected-model', selectedModel)
  }, [selectedModel])

  useEffect(() => {
    if (generatedImageUrl) {
      localStorage.setItem('aiccore-challenge-generated-image', generatedImageUrl)
    }
  }, [generatedImageUrl])

  useEffect(() => {
    if (comparisonResult) {
      localStorage.setItem('aiccore-challenge-comparison-result', JSON.stringify(comparisonResult))
    }
  }, [comparisonResult])

  const fetchReferenceImages = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_reference_images')
        .select('*')
        .eq('is_active', true)
        .order('difficulty_level', { ascending: true })

      if (error) throw error
      setReferenceImages(data || [])
    } catch (error) {
      console.error('Error fetching reference images:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('image_recreation_attempts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setUserAttempts(data || [])
    } catch (error) {
      console.error('Error fetching user attempts:', error)
    }
  }

  const generateImage = async () => {
    if (!userPrompt.trim() || !selectedModel) return

    setIsGenerating(true)
    setComparisonResult(null) // Clear previous comparison
    setSavedImageId(null) // Clear previous save status
    
    try {
      const response = await fetch(`/api/generate/${selectedModel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          params: { temperature: 1.0 }
        }),
      })

      if (!response.ok) throw new Error('Failed to generate image')

      const data = await response.json()
      setGeneratedImageUrl(data.url)
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveToGallery = async () => {
    if (!generatedImageUrl || !userPrompt || !user?.id) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: generatedImageUrl,
          prompt: userPrompt,
          modelUsed: selectedModel,
          userId: user.id, // Added missing userId field
          revisedPrompt: selectedImage ? `Challenge: ${selectedImage.title} - ${userPrompt}` : userPrompt,
          generationParams: {
            temperature: 1.0,
            challenge_type: 'image_recreation',
            reference_image_id: selectedImage?.id
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Save API error:', errorData)
        throw new Error(errorData.error || 'Failed to save image')
      }

      const data = await response.json()
      setSavedImageId(data.imageId) // Fixed: API returns imageId, not id
      
      // Show success feedback
      alert('✅ Image saved to your gallery!')
    } catch (error) {
      console.error('Error saving image:', error)
      alert('❌ Failed to save image. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const compareImages = async () => {
    if (!selectedImage || !generatedImageUrl) return

    setIsComparing(true)
    try {
      // Real GPT-4V comparison
      const response = await fetch('/api/compare-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referenceImageUrl: selectedImage.image_url,
          generatedImageUrl: generatedImageUrl,
          referenceTitle: selectedImage.title,
          userPrompt: userPrompt
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // If it's a parsing error, show the raw GPT-4V response
        if (errorData.error?.includes("Failed to parse GPT-4V response") && errorData.raw_response) {
          alert(`❌ GPT-4V responded but in an unexpected format.\n\nRaw response:\n${errorData.raw_response}`)
          return
        }
        
        throw new Error(errorData.error || 'Failed to compare images')
      }

      const analysisData = await response.json()
      
      const result: AttemptResult = {
        score: analysisData.score,
        feedback: analysisData.feedback,
        suggestions: analysisData.suggestions,
        generated_image_url: generatedImageUrl,
        strengths: analysisData.strengths,
        areas_for_improvement: analysisData.areas_for_improvement,
        helpful_keywords: analysisData.helpful_keywords,
        suggested_prompt: analysisData.suggested_prompt,
        raw_analysis: analysisData.raw_analysis,
        parsing_error: analysisData.parsing_error
      }

      setComparisonResult(result)

      // Save attempt to database
      await supabase
        .from('image_recreation_attempts')
        .insert({
          user_id: user?.id,
          reference_image_id: selectedImage.id,
          user_prompt: userPrompt,
          generated_image_url: generatedImageUrl,
          model_used: selectedModel,
          gpt4v_score: result.score,
          gpt4v_feedback: result.feedback,
          improvement_suggestions: result.suggestions,
        })

      await fetchUserAttempts()
    } catch (error) {
      console.error('Error comparing images:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`❌ Comparison failed: ${errorMessage}`)
    } finally {
      setIsComparing(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600'
    if (score >= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Challenge Header */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-800 dark:text-white">AICCORE Image Recreation Excerise </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Select a reference image and recreate it using AI</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reference Images Gallery */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <Image className="h-5 w-5" />
                Reference Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {referenceImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 ${
                      selectedImage?.id === img.id ? 'ring-4 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.image_url}
                      alt={img.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-medium text-sm mb-1">{img.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getDifficultyColor(img.difficulty_level)} text-white text-xs`}>
                          {img.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="text-white border-white text-xs">
                          {img.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenge Progress & Master Guide */}
        <div>
          <div className="space-y-6 sticky top-6">
            

            {/* Master Guide - Tips & Tricks */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <Target className="h-5 w-5" />
                  Master Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Quick Strategy Guide */}
                <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200/30">
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
                    🎯 5-Step Success Strategy
                  </h4>
                  <ol className="text-xs space-y-2 text-emerald-600 dark:text-emerald-400">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Study</strong> the reference for 30 seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Identify</strong> style, lighting, colors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Write</strong> detailed prompt (20+ words)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">4</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Generate</strong> and compare carefully</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">5</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Refine</strong> based on GPT-4V feedback</span>
                    </li>
                  </ol>
                </div>

                    
                    

                   

               
                {/* Scoring Guide */}
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    📊 Scoring Breakdown
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-green-50/50 dark:bg-green-900/20 rounded">
                      <div className="w-8 h-2 bg-green-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-200"><strong>9-10:</strong> Perfect recreation - style, colors, composition match exactly</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded">
                      <div className="w-8 h-2 bg-blue-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-200"><strong>7-8:</strong> Very good - most elements captured, minor differences</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50/50 dark:bg-yellow-900/20 rounded">
                      <div className="w-8 h-2 bg-yellow-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-200"><strong>5-6:</strong> Good attempt - some key elements missing</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-orange-50/50 dark:bg-orange-900/20 rounded">
                      <div className="w-8 h-2 bg-orange-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-200"><strong>3-4:</strong> Basic resemblance - needs significant improvement</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50/50 dark:bg-red-900/20 rounded">
                      <div className="w-8 h-2 bg-red-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-200"><strong>1-2:</strong> Very different - try studying the reference more</span>
                    </div>
                  </div>
                </div>          

                {/* Common Mistakes */}
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    ⚠️ Avoid These Mistakes
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 p-2 bg-red-50/50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                      <span>❌</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Vague prompts:</strong> "nice picture" → Use specific descriptions</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-red-50/50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                      <span>❌</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Ignoring style:</strong> Missing "oil painting", "watercolor", "digital art"</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-red-50/50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                      <span>❌</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Wrong lighting:</strong> Not describing the light source and shadows</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-red-50/50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                      <span>❌</span>
                      <span className="text-gray-700 dark:text-gray-200"><strong>Missing colors:</strong> Not specifying the color palette</span>
                    </div>
                  </div>
                </div>

                {/* Model Selection Guide */}
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    🤖 Model Selection Guide
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-orange-50/50 dark:bg-orange-900/20 rounded">
                      <strong className="text-orange-700 dark:text-orange-300">DALL-E 3:</strong> <span className="text-gray-600 dark:text-gray-300">Best overall quality and prompt adherence</span>
                    </div>
                    <div className="p-2 bg-purple-50/50 dark:bg-purple-900/20 rounded">
                      <strong className="text-purple-700 dark:text-purple-300">GPT-4o:</strong> <span className="text-gray-600 dark:text-gray-300">Excellent for artistic and creative interpretations</span>
                    </div>
                    <div className="p-2 bg-green-50/50 dark:bg-green-900/20 rounded">
                      <strong className="text-green-700 dark:text-green-300">FLUX Schnell:</strong> <span className="text-gray-600 dark:text-gray-300">Fast generation with stylized results</span>
                    </div>
                    <div className="p-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded">
                      <strong className="text-emerald-700 dark:text-emerald-300">MiniMax Image-01:</strong> <span className="text-gray-600 dark:text-gray-300">Advanced prompt optimization and aspect ratios</span>
                    </div>
                    <div className="p-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded">
                      <strong className="text-indigo-700 dark:text-indigo-300">Recraft V3:</strong> <span className="text-gray-600 dark:text-gray-300">Professional image generation with high-quality output</span>
                    </div>
                    <div className="p-2 bg-red-50/50 dark:bg-red-900/20 rounded">
                      <strong className="text-red-700 dark:text-red-300">Imagen-4:</strong> <span className="text-gray-600 dark:text-gray-300">Superior color accuracy and composition</span>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Generation Interface */}
      {selectedImage && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <Wand2 className="h-5 w-5" />
              Recreate: {selectedImage.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference Image */}
              <div>
                <h3 className="font-medium mb-3 text-gray-800 dark:text-white">Reference Image</h3>
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                  className="w-full rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => openModal('reference')}
                />
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{selectedImage.description}</p>
              </div>

              {/* Generated Image */}
              <div>
                <h3 className="font-medium mb-3 text-gray-800 dark:text-white">Your Recreation</h3>
                {generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="Generated"
                    className="w-full rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => openModal('generated')}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Upload className="h-12 w-12 mx-auto mb-2" />
                      <p>Generate your image first</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-4">
              {/* Prompt Hints */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                  💡 Pro Tips for Better Recreations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <strong className="text-purple-600 dark:text-purple-400">📝 Be Specific:</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Describe colors, shapes, lighting, and style in detail
                    </p>
                  </div>
                  <div>
                    <strong className="text-green-600 dark:text-green-400">🎨 Include Style:</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      "oil painting", "watercolor", "digital art", "photorealistic"
                    </p>
                  </div>
                  <div>
                    <strong className="text-orange-600 dark:text-orange-400">🔍 Study the Reference:</strong>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Look at lighting direction, composition, and mood
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-800 dark:text-white">
                  Your Recreation Prompt
                </label>
                <Textarea
                  placeholder={`Try something like: "${selectedImage?.category === 'abstract' 
                    ? 'Abstract painting with vibrant swirling colors, bold brushstrokes, dynamic composition with blues and oranges, expressionist style'
                    : selectedImage?.category === 'landscape' 
                    ? 'Serene mountain landscape at golden hour, soft natural lighting, misty atmosphere, realistic photography style'
                    : selectedImage?.category === 'portrait'
                    ? 'Professional portrait with studio lighting, soft shadows, detailed facial features, photorealistic style'
                    : 'Detailed description of the image including style, lighting, colors, composition, and mood'
                  }"`}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  rows={4}
                  className="bg-white/50 border-white/20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 <strong>Quick tip:</strong> Look at the reference image and describe what you see - colors, lighting, style, composition, and mood!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(MODEL_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key}>{config.name}</option>
                ))}
              </select>

              <Button
                onClick={generateImage}
                disabled={!userPrompt.trim() || isGenerating}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {generatedImageUrl && (
                <>
                  <Button
                    onClick={saveToGallery}
                    disabled={isSaving || savedImageId !== null}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    {isSaving ? (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : savedImageId ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Saved to Gallery
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save to Gallery
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={compareImages}
                    disabled={isComparing}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    {isComparing ? (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Compare & Score
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Comparison Result */}
            {comparisonResult && (
              <div className="space-y-4">
                <Alert className={`${
                  comparisonResult.score >= 8 ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 
                  comparisonResult.score >= 6 ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-orange-200 bg-orange-50 dark:bg-orange-900/20'
                }`}>
                  <Trophy className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-4">
                      {/* Score Section */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-xl text-gray-800 dark:text-white">Score: {comparisonResult.score}/10</span>
                        <div className="flex">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < comparisonResult.score
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {comparisonResult.score >= 9 && (
                          <Badge className="bg-green-500 text-white">Excellent!</Badge>
                        )}
                        {comparisonResult.score >= 7 && comparisonResult.score < 9 && (
                          <Badge className="bg-blue-500 text-white">Good Work!</Badge>
                        )}
                        {comparisonResult.score >= 5 && comparisonResult.score < 7 && (
                          <Badge className="bg-yellow-500 text-white">Keep Trying!</Badge>
                        )}
                        {comparisonResult.score < 5 && (
                          <Badge className="bg-orange-500 text-white">Room to Improve!</Badge>
                        )}
                      </div>
                      
                      {/* Detailed Feedback Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* General Feedback */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
                              ✅ Overall Feedback
                            </h4>
                            <p className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-gray-700 dark:text-gray-200">{comparisonResult.feedback}</p>
                          </div>
                          
                          {comparisonResult.strengths && (
                            <div>
                              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                                💪 What You Did Well
                              </h4>
                              <p className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-gray-700 dark:text-gray-200">{comparisonResult.strengths}</p>
                            </div>
                          )}
                        </div>

                        {/* Improvement Areas */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
                              💡 Suggestions for Improvement
                            </h4>
                            <p className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-gray-700 dark:text-gray-200">{comparisonResult.suggestions}</p>
                          </div>
                          
                          {comparisonResult.areas_for_improvement && (
                            <div>
                              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-1">
                                🎯 Focus Areas
                              </h4>
                              <p className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-gray-700 dark:text-gray-200">{comparisonResult.areas_for_improvement}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* GPT-4V Recommended Keywords */}
                      {comparisonResult.helpful_keywords && comparisonResult.helpful_keywords.length > 0 && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                          <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
                            🎯 GPT-4V Recommends Adding These Keywords
                          </h4>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3">
                            Based on your image comparison, add these specific words to your prompt for a better recreation:
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {comparisonResult.helpful_keywords.map((keyword, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  const currentPrompt = userPrompt
                                  const newPrompt = currentPrompt ? `${currentPrompt}, ${keyword}` : keyword
                                  setUserPrompt(newPrompt)
                                }}
                                className="bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors cursor-pointer border border-emerald-300 dark:border-emerald-600"
                              >
                                + {keyword}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                            <span>💡</span>
                            <span><strong>Click any keyword</strong> to automatically add it to your prompt and try again!</span>
                          </div>
                        </div>
                      )}

                      {/* GPT-4V Generated Optimal Prompt */}
                      {comparisonResult.suggested_prompt && (
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                          <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                            ✨ GPT-4V Generated Optimal Prompt
                          </h4>
                          <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                            Based on analyzing the reference image, here's a complete prompt that should get you a high score:
                          </p>
                          <div className="bg-amber-100 dark:bg-amber-800/50 p-3 rounded-lg border border-amber-200 dark:border-amber-600 mb-3">
                            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                              "{comparisonResult.suggested_prompt}"
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setUserPrompt(comparisonResult.suggested_prompt!)
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              🎯 Use This Prompt
                            </button>
                            <button
                              onClick={() => {
                                const currentPrompt = userPrompt
                                const optimalPrompt = comparisonResult.suggested_prompt!
                                const combinedPrompt = currentPrompt 
                                  ? `${currentPrompt}\n\nOptimal elements: ${optimalPrompt}`
                                  : optimalPrompt
                                setUserPrompt(combinedPrompt)
                              }}
                              className="bg-amber-200 dark:bg-amber-700 text-amber-700 dark:text-amber-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-amber-300 dark:hover:bg-amber-600 flex items-center gap-2"
                            >
                              📝 Combine with Mine
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-2">
                            <span>💡</span>
                            <span>This is what GPT-4V thinks would recreate the reference image perfectly. Study it to learn prompt writing!</span>
                          </div>
                        </div>
                      )}

                      {/* Prompt Improvement Hints */}
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          🚀 Prompt Tips to Score Higher
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <strong className="text-gray-700 dark:text-gray-200">🎨 Style & Technique:</strong>
                            <ul className="mt-1 space-y-1 ml-2 text-gray-600 dark:text-gray-300">
                              <li>• "in the style of [artist/movement]"</li>
                              <li>• "oil painting technique"</li>
                              <li>• "watercolor style"</li>
                              <li>• "photorealistic rendering"</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <strong className="text-gray-700 dark:text-gray-200">💡 Lighting & Mood:</strong>
                            <ul className="mt-1 space-y-1 ml-2 text-gray-600 dark:text-gray-300">
                              <li>• "soft natural lighting"</li>
                              <li>• "dramatic shadows"</li>
                              <li>• "golden hour lighting"</li>
                              <li>• "studio lighting setup"</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <strong className="text-gray-700 dark:text-gray-200">🖼️ Composition:</strong>
                            <ul className="mt-1 space-y-1 ml-2 text-gray-600 dark:text-gray-300">
                              <li>• "centered composition"</li>
                              <li>• "rule of thirds"</li>
                              <li>• "close-up portrait"</li>
                              <li>• "wide angle landscape"</li>
                            </ul>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <strong className="text-gray-700 dark:text-gray-200">🎨 Color & Details:</strong>
                            <ul className="mt-1 space-y-1 ml-2 text-gray-600 dark:text-gray-300">
                              <li>• "vibrant colors"</li>
                              <li>• "muted earth tones"</li>
                              <li>• "high detail"</li>
                              <li>• "soft textures"</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Try Again Suggestion */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                          🔄 Ready to Try Again?
                        </h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                          Based on the feedback above, try updating your prompt with more specific details about:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {comparisonResult.score < 6 && (
                            <>
                              <Badge variant="outline" className="text-xs">Composition details</Badge>
                              <Badge variant="outline" className="text-xs">Lighting description</Badge>
                              <Badge variant="outline" className="text-xs">Color palette</Badge>
                              <Badge variant="outline" className="text-xs">Art style</Badge>
                            </>
                          )}
                          {comparisonResult.score >= 6 && comparisonResult.score < 8 && (
                            <>
                              <Badge variant="outline" className="text-xs">Fine details</Badge>
                              <Badge variant="outline" className="text-xs">Texture description</Badge>
                              <Badge variant="outline" className="text-xs">Mood/atmosphere</Badge>
                            </>
                          )}
                          {comparisonResult.score >= 8 && (
                            <>
                              <Badge variant="outline" className="text-xs">Perfect the details!</Badge>
                              <Badge variant="outline" className="text-xs">Try a different model</Badge>
                            </>
                          )}
                        </div>
                      </div>

                      {savedImageId && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            Challenge result saved to your gallery!
                          </span>
                        </div>
                      )}
                      
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Size Image Modal */}
      <AnimatePresence>
        {modalOpen && selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal} // Close on backdrop click
          >
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on modal content
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-60 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Model Badge */}
              <div className="absolute top-4 left-4 z-60">
                <Badge className="bg-white/90 text-gray-800">
                  {modalImageType === 'reference' ? 'Reference Image' : selectedModel}
                </Badge>
              </div>

              {/* Full Size Image */}
              <img
                src={modalImageType === 'reference' ? selectedImage.image_url : generatedImageUrl}
                alt={modalImageType === 'reference' ? selectedImage.title : 'Generated image'}
                className="w-full h-full object-contain"
                style={{ maxHeight: '80vh' }}
              />

              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {modalImageType === 'reference' ? selectedImage.title : 'Your Recreation'}
                    </p>
                    <p className="text-white/80 text-xs">
                      {modalImageType === 'reference' ? `${selectedImage.difficulty_level} • ${selectedImage.category}` : 'AI Generated Image'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  {modalImageType === 'reference' 
                    ? `"${selectedImage.description}"` 
                    : userPrompt ? `"${userPrompt}"` : 'Generated with AI'
                  }
                </p>
                {modalImageType === 'generated' && comparisonResult && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs text-white/70 mb-1">Score: {comparisonResult.score}/10</p>
                    <p className="text-xs text-white/90 leading-relaxed">
                      {comparisonResult.feedback}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 