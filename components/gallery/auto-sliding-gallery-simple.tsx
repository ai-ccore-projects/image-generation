"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, User, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface CommunityImage {
  id: string
  prompt: string
  model_used: string
  image_url: string
  created_at: string
  user_id: string
  username: string
  display_name: string
  avatar_url?: string
}

export function AutoSlidingGallerySimple() {
  const { user, loading } = useAuth()
  const [images, setImages] = useState<CommunityImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<CommunityImage | null>(null)

  // Authentication check - only show to signed-in users
  if (loading) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show placeholder for non-authenticated users instead of requiring auth
  if (!user) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                Community Gallery
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Discover amazing AI-generated artwork from our creative community. Sign in to explore the full gallery and share your own creations.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ✨ <strong>Join our community</strong> to view and share incredible AI art creations
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    if (images.length === 0) return

    // Start auto-sliding
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        }
      }, 3000) // Change every 3 seconds
    }

    startAutoSlide()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [images, isPaused])

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/gallery/public?limit=20', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        if (data.images && Array.isArray(data.images)) {
          setImages(data.images)
        } else {
          console.warn('No images data received or invalid format')
          setImages([])
        }
      } else {
        console.error('API responded with error:', response.status)
        setImages([])
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API request timed out')
      } else {
        console.error('Error fetching images:', error)
      }
      setImages([]) // Set empty array instead of leaving undefined
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const openModal = (image: CommunityImage) => {
    setSelectedImage(image)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedImage(null)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (isLoading) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading community gallery...</p>
          </div>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Community Gallery Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Be the first to share your AI creations with the world!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentImage = images[currentIndex]

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <div className="absolute top-8 left-8 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Community Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Discover amazing AI creations
            </p>
          </div>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 max-w-md">
          <Card className="bg-white/90 backdrop-blur-sm border-white/20 overflow-hidden shadow-2xl">
            <div 
              className="relative aspect-square overflow-hidden cursor-pointer"
              onClick={() => openModal(currentImage)}
            >
              <img
                src={currentImage.image_url}
                alt={currentImage.prompt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  console.error(`Failed to load image: ${currentImage.prompt}`)
                  setImageLoadErrors(prev => new Set([...prev, currentImage.id]))
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='0.35em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3EImage Unavailable%3C/text%3E%3C/svg%3E"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Model Badge */}
              <div className="absolute top-3 right-3">
                <Badge className="bg-white/90 text-gray-800 text-xs">
                  {currentImage.model_used}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Artist Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {currentImage.avatar_url ? (
                    <img
                      src={currentImage.avatar_url}
                      alt={currentImage.display_name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : null}
                  <User className={`h-4 w-4 text-white ${currentImage.avatar_url ? 'hidden' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-gray-800">
                    {currentImage.display_name || currentImage.username || 'Anonymous Artist'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatDate(currentImage.created_at)}
                  </p>
                </div>
              </div>

              {/* Prompt */}
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                "{currentImage.prompt}"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white hover:bg-black/60 hover:scale-110 transition-all duration-300 z-40 shadow-lg"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white hover:bg-black/60 hover:scale-110 transition-all duration-300 z-40 shadow-lg"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Progress Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? 'bg-purple-500 w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Auto-play Indicator */}
      <div className="absolute top-4 right-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        {isPaused ? 'Paused' : 'Auto-sliding'}
      </div>

      {/* Simple Modal (no framer-motion) */}
      {modalOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
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
                {selectedImage.model_used}
              </Badge>
            </div>

            {/* Full Size Image */}
            <img
              src={selectedImage.image_url}
              alt={selectedImage.prompt}
              className="w-full h-full object-contain"
              style={{ maxHeight: '80vh' }}
            />

            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {selectedImage.avatar_url ? (
                    <img
                      src={selectedImage.avatar_url}
                      alt={selectedImage.display_name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {selectedImage.display_name || selectedImage.username || 'Anonymous Artist'}
                  </p>
                  <p className="text-white/80 text-xs">
                    {formatDate(selectedImage.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                "{selectedImage.prompt}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 