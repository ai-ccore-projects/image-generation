"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, User, X, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

export function AutoSlidingGallery() {
  const { user, loading } = useAuth()
  const [images, setImages] = useState<CommunityImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [centerImageIndex, setCenterImageIndex] = useState(0)
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

  if (!user) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                Community Gallery
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Please sign in to view our amazing AI-generated artwork gallery created by our talented community members.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                🔒 <strong>Members Only</strong> - This gallery showcases incredible AI creations from authenticated users
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

  useEffect(() => {
    // Update center image index for pop effect
    setCenterImageIndex(currentIndex)
  }, [currentIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) {
        if (e.key === 'Escape') {
          closeModal()
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          navigateModal('prev')
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          navigateModal('next')
        }
      } else {
        // Gallery navigation when modal is closed
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          prevSlide()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          nextSlide()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    if (modalOpen) {
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [modalOpen, selectedImage])

  const openModal = (image: CommunityImage) => {
    setSelectedImage(image)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedImage(null)
  }

  const navigateModal = (direction: 'prev' | 'next') => {
    if (!selectedImage) return
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id)
    let newIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % images.length
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length
    }
    
    setSelectedImage(images[newIndex])
  }

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

  const getVisibleImages = () => {
    if (images.length === 0) return []
    
    const visibleCount = 5 // Show 5 images at a time
    const visible = []
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i - 2 + images.length) % images.length
              visible.push({
          ...images[index],
          position: i,
          isCenter: i === 2
        })
    }
    
    return visible
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    // Don't pause auto-sliding when user manually navigates
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    // Don't pause auto-sliding when user manually navigates
  }

  const visibleImages = getVisibleImages()

  return (
    <div 
      className="relative h-[600px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"
    >
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

      {/* Auto-sliding Cards Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center justify-center gap-1 w-full max-w-5xl px-4">
          {visibleImages.map((image, idx) => {
            const isCenter = image.isCenter
            const scale = isCenter ? 1.2 : image.position === 1 || image.position === 3 ? 0.8 : 0.5
            const opacity = isCenter ? 1 : image.position === 1 || image.position === 3 ? 0.6 : 0.3
            const zIndex = isCenter ? 30 : image.position === 1 || image.position === 3 ? 20 : 10

            return (
              <motion.div
                key={`${image.id}-${idx}`}
                className="relative flex-shrink-0"
                style={{ zIndex }}
                initial={{ scale: 0.7, opacity: 0.5 }}
                animate={{ 
                  scale, 
                  opacity,
                  y: isCenter ? -30 : 0
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeInOut",
                  type: "spring",
                  damping: 15
                }}
              >
                <Card className={`w-72 bg-white/90 backdrop-blur-sm border-white/20 overflow-hidden transition-all duration-300 ${isCenter ? 'ring-4 ring-purple-500/60 shadow-2xl' : 'shadow-lg'}`}>
                  {/* Image */}
                  <div 
                    className="relative aspect-square overflow-hidden cursor-pointer"
                    onClick={() => openModal(image)}
                  >
                    <motion.img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      animate={isCenter ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 0.8 }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        console.error(`Failed to load image: ${image.prompt} (${image.model_used})`, image.image_url)
                        setImageLoadErrors(prev => new Set([...prev, image.id]))
                        // Create a custom placeholder
                        target.style.display = 'none'
                        const placeholder = document.createElement('div')
                        placeholder.className = 'w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center'
                        placeholder.innerHTML = `
                          <div class="text-center text-gray-600">
                            <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                            </svg>
                            <p class="text-sm font-medium">Image Loading Failed</p>
                            <p class="text-xs opacity-60">${image.model_used}</p>
                          </div>
                        `
                        target.parentElement?.appendChild(placeholder)
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.opacity = '1'
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Model Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-gray-800 text-xs">
                        {image.model_used}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Artist Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        {image.avatar_url ? (
                          <img
                            src={image.avatar_url}
                            alt={image.display_name}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : null}
                        <User className={`h-4 w-4 text-white ${image.avatar_url ? 'hidden' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-800">
                          {image.display_name || image.username || 'Anonymous Artist'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(image.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Prompt */}
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      "{image.prompt}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
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

      {/* Debug Panel - Show failed images */}
      {imageLoadErrors.size > 0 && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-20 left-4 bg-red-500/90 text-white p-3 rounded-lg text-xs max-w-xs">
          <p className="font-bold mb-1">⚠️ Failed to load {imageLoadErrors.size} images</p>
          <p className="opacity-90">Check browser console for details</p>
        </div>
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

              {/* Navigation Arrows */}
              <button
                onClick={() => navigateModal('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-60 w-12 h-12 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => navigateModal('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-60 w-12 h-12 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Model Badge */}
              <div className="absolute top-4 left-4 z-60">
                <Badge className="bg-white/90 text-gray-800">
                  {selectedImage.model_used}
                </Badge>
              </div>

              {/* Image Counter */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-60">
                <Badge className="bg-black/50 text-white">
                  {images.findIndex(img => img.id === selectedImage.id) + 1} / {images.length}
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
                    ) : null}
                    <User className={`h-4 w-4 text-white ${selectedImage.avatar_url ? 'hidden' : ''}`} />
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 