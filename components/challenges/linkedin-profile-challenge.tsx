"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Camera, 
  User, 
  Upload, 
  CheckCircle2,
  Trophy,
  Target,
  Star,
  Car,
  GraduationCap,
  Building,
  Users,
  Presentation,
  UserCheck,
  Wand2,
  RotateCcw,
  Save,
  Plus,
  Edit,
  Combine,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  Zap,
  TrendingUp,
  X
} from "lucide-react"

interface EditingChallenge {
  id: number
  title: string
  description: string
  category: "single" | "multi"
  model: string
  points: number
  difficulty: "easy" | "medium" | "hard"
  icon: any
  input_requirements: string[]
  example_prompt: string
  tips: string[]
  image: string
}

interface GeneratedPhoto {
  task_id: number
  image_url: string
  user_prompt: string
  model_used: string
  input_images: Record<string, string>
  is_saved: boolean
}

export function LinkedInProfileChallenge() {
  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>("")
  const [additionalImages, setAdditionalImages] = useState<Record<string, File>>({})
  const [additionalImageUrls, setAdditionalImageUrls] = useState<Record<string, string>>({})
  const [selectedTask, setSelectedTask] = useState<EditingChallenge | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedPhotos, setGeneratedPhotos] = useState<Record<number, GeneratedPhoto>>({})
  const [currentGeneration, setCurrentGeneration] = useState<string>("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState<string>("")
  const [modalImageType, setModalImageType] = useState<'upload' | 'generated'>('generated')
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

  const openModal = (imageUrl: string, type: 'upload' | 'generated') => {
    setModalImageUrl(imageUrl)
    setModalImageType(type)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const singleImageModels = [
    { id: "flux-kontext-pro", name: "FLUX Kontext Pro", description: "Advanced image editing with style transfer and object manipulation" },
    { id: "gpt-image-1", name: "GPT-Image-1", description: "Professional image composition and pattern integration" }
  ]
  const editingChallenges: EditingChallenge[] = [
    // Professional Image Editing Tasks (6)
    {
      id: 1,
      title: "Professional Portrait",
      description: "Create a professional portrait with studio-quality lighting and composition",
      category: "single",
      model: "flux-kontext-pro",
      points: 15,
      difficulty: "easy",
      icon: UserCheck,
      input_requirements: ["Your photo"],
      example_prompt: "Transform this into a professional business portrait with studio lighting and clean background while preserving facial features",
      tips: ["Use 'while preserving facial features'", "Specify lighting type", "Mention professional attire"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face"
    },
    {
      id: 2,
      title: "Artistic Style Transfer",
      description: "Transform your photo into various artistic styles like oil painting or watercolor",
      category: "single", 
      model: "flux-kontext-pro",
      points: 20,
      difficulty: "medium",
      icon: Camera,
      input_requirements: ["Your photo"],
      example_prompt: "Convert to watercolor painting while maintaining composition and facial features",
      tips: ["Be specific about art style", "Use 'while maintaining composition'", "Mention preservation of key features"],
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Background Replacement",
      description: "Change your photo background to professional office or studio settings",
      category: "single",
      model: "flux-kontext-pro",
      points: 25,
      difficulty: "medium",
      icon: MapPin,
      input_requirements: ["Your photo"],
      example_prompt: "Change the background to a modern office while keeping the person in the same pose and lighting",
      tips: ["Specify exact background type", "Use 'while keeping the person'", "Mention lighting consistency"],
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Professional Attire Edit",
      description: "Transform casual clothing into professional business attire",
      category: "single",
      model: "flux-kontext-pro", 
      points: 20,
      difficulty: "medium",
      icon: Edit,
      input_requirements: ["Your photo"],
      example_prompt: "Change to formal business suit while preserving the person's face and pose",
      tips: ["Specify exact clothing type", "Use preservation phrases", "Mention color preferences"],
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Lighting Enhancement",
      description: "Improve photo lighting to achieve professional studio quality",
      category: "single",
      model: "gpt-image-1",
      points: 30,
      difficulty: "hard",
      icon: Target,
      input_requirements: ["Your photo"],
      example_prompt: "Add professional studio lighting pattern to enhance the portrait quality",
      tips: ["Describe lighting pattern", "Mention enhancement goals", "Use professional terminology"],
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      title: "Corporate Headshot",
      description: "Create a polished corporate headshot suitable for LinkedIn profiles",
      category: "single",
      model: "gpt-image-1",
      points: 35,
      difficulty: "hard",
      icon: Building,
      input_requirements: ["Your photo"],
      example_prompt: "Transform into a polished corporate headshot with professional backdrop and lighting",
      tips: ["Mention corporate style", "Specify backdrop preferences", "Use professional descriptors"],
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
    }
  ]

  const uploadImage = async (file: File, key: string) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${key}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName)
        if (key === 'main') {
          setUserPhotoUrl(data.publicUrl)
        } else {
          setAdditionalImageUrls(prev => ({ ...prev, [key]: data.publicUrl }))
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }
  const generateEditedPhoto = async () => {
    if (!selectedTask || !customPrompt.trim() || !selectedModel) {
      alert('❌ Please ensure you have selected a task, written a prompt, and chosen a model.')
      return
    }

    // Validate image requirements - all tasks now require main photo
    if (!userPhotoUrl) {
      alert('❌ Please upload your main photo to continue.')
      return
    }

    setIsGenerating(true)
    try {
      let params: any = {}
      
      // All tasks are now single image editing tasks
      if (selectedModel === "flux-kontext-pro") {
        params.input_image = userPhotoUrl
        params.aspect_ratio = "match_input_image"
        params.output_format = "jpg"
        params.safety_tolerance = 2
      } else if (selectedModel === "gpt-image-1") {
        params.input_images = [userPhotoUrl]
      }

      console.log(`🎨 Starting single image editing:`)
      console.log('📝 Model:', selectedModel)
      console.log('🖼️ Input image:', userPhotoUrl ? 'Provided' : 'Missing')
      console.log('📋 Prompt:', customPrompt)
      console.log('⚙️ Parameters:', params)

      const response = await fetch(`/api/generate/${selectedModel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: customPrompt,
          params: params
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const data = await response.json()
      
      if (!data.url) {
        throw new Error('No image URL returned from API')
      }

      setCurrentGeneration(data.url)

      // Store the generation result
      const inputImages: Record<string, string> = {
        main: userPhotoUrl
      }

      setGeneratedPhotos(prev => ({
        ...prev,
        [selectedTask.id]: {
          task_id: selectedTask.id,
          image_url: data.url,
          user_prompt: customPrompt,
          model_used: selectedModel,
          input_images: inputImages,
          is_saved: false
        }
      }))

      console.log('Image generated successfully:', data.url)

    } catch (error) {
      console.error('Error generating photo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`❌ Failed to generate image: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const savePhotoToGallery = async (taskId: number) => {
    const photo = generatedPhotos[taskId]
    if (!photo || !user?.id) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: photo.image_url,
          prompt: photo.user_prompt,
          modelUsed: photo.model_used,
          userId: user.id,
          revisedPrompt: `LinkedIn Editing Challenge - ${editingChallenges.find(t => t.id === taskId)?.title}: ${photo.user_prompt}`,
          generationParams: {
            temperature: 0.8,
            challenge_type: 'linkedin_editing',
            task_id: taskId,
            input_images: photo.input_images
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save image')
      }

      setGeneratedPhotos(prev => ({
        ...prev,
        [taskId]: { ...prev[taskId], is_saved: true }
      }))

      alert('✅ Photo saved to your gallery! You can now view it in the Gallery section.')
    } catch (error) {
      console.error('Error saving photo:', error)
      alert('❌ Failed to save photo. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500'
      case 'medium': return 'bg-amber-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const completedTasks = Object.keys(generatedPhotos).length
  const totalPoints = Object.values(generatedPhotos).reduce((sum, photo) => {
    const task = editingChallenges.find(t => t.id === photo.task_id)
    return sum + (task?.points || 0)
  }, 0)

  useEffect(() => {
    const savedPhotoUrl = localStorage.getItem('linkedin-challenge-main-photo')
    const savedAdditionalUrls = localStorage.getItem('linkedin-challenge-additional-images')
    const savedCompletedTasks = localStorage.getItem('linkedin-challenge-completed-tasks')
    const savedSelectedTask = localStorage.getItem('linkedin-challenge-selected-task')
    const savedSelectedModel = localStorage.getItem('linkedin-challenge-selected-model')
    const savedCustomPrompt = localStorage.getItem('linkedin-challenge-custom-prompt')
    const savedCurrentGeneration = localStorage.getItem('linkedin-challenge-current-generation')
    const savedTaskInputs = localStorage.getItem('linkedin-challenge-task-inputs')
    
    if (savedPhotoUrl) {
      setUserPhotoUrl(savedPhotoUrl)
    }
    if (savedAdditionalUrls) {
      try {
        setAdditionalImageUrls(JSON.parse(savedAdditionalUrls))
      } catch (e) {
        console.error('Error parsing saved additional images:', e)
      }
    }
    if (savedCompletedTasks) {
      try {
        setGeneratedPhotos(JSON.parse(savedCompletedTasks))
      } catch (e) {
        console.error('Error parsing saved completed tasks:', e)
      }
    }
    if (savedSelectedTask) {
      try {
        const taskData = JSON.parse(savedSelectedTask)
        const task = editingChallenges.find(t => t.id === taskData.id)
        if (task) {
          setSelectedTask(task)
        }
      } catch (e) {
        console.error('Error parsing saved selected task:', e)
      }
    }
    if (savedSelectedModel) {
      setSelectedModel(savedSelectedModel)
    }
    if (savedCustomPrompt) {
      setCustomPrompt(savedCustomPrompt)
    }
    if (savedCurrentGeneration) {
      setCurrentGeneration(savedCurrentGeneration)
    }
    if (savedTaskInputs) {
      try {
        setTaskInputs(JSON.parse(savedTaskInputs))
      } catch (e) {
        console.error('Error parsing saved task inputs:', e)
      }
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (userPhotoUrl) {
      localStorage.setItem('linkedin-challenge-main-photo', userPhotoUrl)
    }
  }, [userPhotoUrl])

  useEffect(() => {
    if (Object.keys(additionalImageUrls).length > 0) {
      localStorage.setItem('linkedin-challenge-additional-images', JSON.stringify(additionalImageUrls))
    }
  }, [additionalImageUrls])

  useEffect(() => {
    if (Object.keys(generatedPhotos).length > 0) {
      localStorage.setItem('linkedin-challenge-completed-tasks', JSON.stringify(generatedPhotos))
    }
  }, [generatedPhotos])

  // Save additional persistent states
  useEffect(() => {
    if (selectedTask) {
      localStorage.setItem('linkedin-challenge-selected-task', JSON.stringify({ id: selectedTask.id, title: selectedTask.title }))
    } else {
      localStorage.removeItem('linkedin-challenge-selected-task')
    }
  }, [selectedTask])

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('linkedin-challenge-selected-model', selectedModel)
    } else {
      localStorage.removeItem('linkedin-challenge-selected-model')
    }
  }, [selectedModel])

  useEffect(() => {
    if (customPrompt) {
      localStorage.setItem('linkedin-challenge-custom-prompt', customPrompt)
    } else {
      localStorage.removeItem('linkedin-challenge-custom-prompt')
    }
  }, [customPrompt])

  useEffect(() => {
    if (currentGeneration) {
      localStorage.setItem('linkedin-challenge-current-generation', currentGeneration)
    } else {
      localStorage.removeItem('linkedin-challenge-current-generation')
    }
  }, [currentGeneration])

  useEffect(() => {
    if (Object.keys(taskInputs).length > 0) {
      localStorage.setItem('linkedin-challenge-task-inputs', JSON.stringify(taskInputs))
    } else {
      localStorage.removeItem('linkedin-challenge-task-inputs')
    }
  }, [taskInputs])

  useEffect(() => {
    if (userPhoto) {
      uploadImage(userPhoto, 'main')
    }
  }, [userPhoto])

  useEffect(() => {
    Object.entries(additionalImages).forEach(([key, file]) => {
      if (file) {
        uploadImage(file, key)
      }
    })
  }, [additionalImages])

  useEffect(() => {
    // Reset model selection when task changes to ensure compatibility
    if (selectedTask) {
      // All tasks are now single image tasks
      if (!singleImageModels.find(m => m.id === selectedModel)) {
        setSelectedModel(singleImageModels[0].id)
      }
    }
  }, [selectedTask])

  const resetChallenge = () => {
    if (confirm("Are you sure you want to reset the entire challenge? This will clear all your progress and uploaded photos.")) {
      setUserPhoto(null)
      setUserPhotoUrl("")
      setAdditionalImages({})
      setAdditionalImageUrls({})
      setSelectedTask(null)
      setSelectedModel("")
      setCustomPrompt("")
      setTaskInputs({})
      setCurrentGeneration("")
      setGeneratedPhotos({})
      // Clear all localStorage
      localStorage.removeItem('linkedin-challenge-main-photo')
      localStorage.removeItem('linkedin-challenge-additional-images')
      localStorage.removeItem('linkedin-challenge-completed-tasks')
      localStorage.removeItem('linkedin-challenge-selected-task')
      localStorage.removeItem('linkedin-challenge-selected-model')
      localStorage.removeItem('linkedin-challenge-custom-prompt')
      localStorage.removeItem('linkedin-challenge-current-generation')
      localStorage.removeItem('linkedin-challenge-task-inputs')
    }
  }

  const changeMainPhoto = () => {
    setUserPhoto(null)
    setUserPhotoUrl("")
    localStorage.removeItem('linkedin-challenge-main-photo')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Challenge Header */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-800 dark:text-white">AICCORE Photo Editing Excerise </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">Transform your photos with AI-powered editing models</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tasks Gallery */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
              <Target className="h-5 w-5" />
              Professional Image Editing Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editingChallenges.map((task) => {
                const isCompleted = generatedPhotos[task.id]
                const isSelected = selectedTask?.id === task.id
                const IconComponent = task.icon

                return (
                  <div
                    key={task.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 ${
                      isCompleted ? 'ring-4 ring-green-500' :
                      isSelected ? 'ring-4 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    {/* Background Image */}
                    <img
                      src={task.image}
                      alt={task.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    {/* Task Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-medium text-sm mb-2">{task.title}</h3>
                      <p className="text-white/80 text-xs mb-3 line-clamp-2">{task.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Generation Interface */}
        {selectedTask && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                <Wand2 className="h-5 w-5" />
                Edit: {selectedTask.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Image Section - Left Side */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-white flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Your Photo
                  </h3>
                  {userPhotoUrl ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={userPhotoUrl}
                          alt="Your photo"
                          className="w-full rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => openModal(userPhotoUrl, 'upload')}
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          ✓ Ready
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={changeMainPhoto}
                          className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUserPhoto(null)
                            setUserPhotoUrl("")
                            localStorage.removeItem('linkedin-challenge-main-photo')
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-purple-300 transition-colors">
                      <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Your Photo</h4>
                      <p className="text-sm text-gray-500 mb-4">Choose the photo you want to edit professionally</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setUserPhoto(e.target.files?.[0] || null)}
                        className="hidden"
                        id="main-upload"
                      />
                      <label 
                        htmlFor="main-upload"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-lg inline-block"
                      >
                        Choose Photo
                      </label>
                    </div>
                  )}

                  {/* Task Details Below Upload */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-800 dark:text-white">Task Details</h4>
                      <div className="bg-white/5 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{selectedTask.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Single Image Editing
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {selectedTask.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Pro Tips */}
                    <div>
                      <h4 className="font-medium mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Pro Tips
                      </h4>
                      <div className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-yellow-200/30">
                        <ul className="space-y-1">
                          {selectedTask.tips.map((tip, index) => (
                            <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated Image Section - Right Side */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-white">Your Generated Image</h3>
                  {currentGeneration ? (
                    <div className="relative">
                      <img
                        src={currentGeneration}
                        alt="Generated"
                        className="w-full rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => openModal(currentGeneration, 'generated')}
                      />
                      {generatedPhotos[selectedTask.id]?.is_saved && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Saved
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center text-gray-500">
                        <Wand2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Generate your edit</p>
                        <p className="text-sm opacity-60">Upload a photo and write a prompt below</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Input and Generation Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-800 dark:text-white">
                    Your Custom Prompt
                  </label>
                  <Textarea
                    placeholder={selectedTask.example_prompt}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                    className="bg-white/50 border-white/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 <strong>Example:</strong> {selectedTask.example_prompt}
                  </p>
                </div>

                {/* Model Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-800 dark:text-white">AI Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {singleImageModels.map((model) => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {singleImageModels.find(m => m.id === selectedModel)?.description}
                    </p>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetChallenge}
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Challenge
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  onClick={generateEditedPhoto}
                  disabled={
                    !customPrompt.trim() || 
                    !selectedModel || 
                    isGenerating ||
                    !userPhotoUrl
                  }
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
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

                {currentGeneration && (
                  <Button
                    onClick={() => savePhotoToGallery(selectedTask.id)}
                    disabled={isSaving}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    {isSaving ? (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save to Gallery
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Validation Alerts */}
              {selectedTask && !userPhotoUrl && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please upload your main photo in the sidebar to continue.
                  </AlertDescription>
                </Alert>
              )}

              {selectedTask && customPrompt.trim() && selectedModel && userPhotoUrl && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    ✅ All requirements met! Ready to generate your professional image edit.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Full Size Image Modal */}
        <AnimatePresence>
          {modalOpen && modalImageUrl && (
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
                    {modalImageType === 'upload' ? 'Your Photo' : selectedModel}
                  </Badge>
                </div>

                {/* Full Size Image */}
                <img
                  src={modalImageUrl}
                  alt={modalImageType === 'upload' ? 'Your uploaded photo' : 'Generated image'}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '80vh' }}
                />

                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {modalImageType === 'upload' ? 'Your Uploaded Photo' : 'AI Generated Edit'}
                      </p>
                      <p className="text-white/80 text-xs">
                        {modalImageType === 'upload' ? 'Original Photo' : `${selectedTask?.title} • ${selectedModel}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {modalImageType === 'upload' 
                      ? selectedTask ? `Ready for: ${selectedTask.description}` : 'Uploaded photo ready for editing'
                      : customPrompt ? `"${customPrompt}"` : 'Generated with AI'
                    }
                  </p>
                  {modalImageType === 'generated' && selectedTask && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-xs text-white/70 mb-1">Task: {selectedTask.title}</p>
                      <p className="text-xs text-white/90 leading-relaxed">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 