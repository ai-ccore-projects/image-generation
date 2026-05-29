"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Heart, Eye, Sparkles, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface TrendingImage {
  id: string
  prompt: string
  model_used: string
  image_url: string
  likes_count: number
  views_count: number
  created_at: string
  username: string
  display_name: string
  avatar_url?: string
}

export function TrendingSlider() {
  const [images, setImages] = useState<TrendingImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    fetchTrendingImages()
  }, [])

  useEffect(() => {
    if (!autoPlay || images.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoPlay, images.length])

  const fetchTrendingImages = async () => {
    try {
      const response = await fetch('/api/gallery/trending?limit=8')
      const data = await response.json()
      if (data.images) {
        setImages(data.images)
      }
    } catch (error) {
      console.error('Error fetching trending images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setAutoPlay(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setAutoPlay(false)
  }

  if (isLoading) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading trending creations...</p>
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
            <Palette className="w-16 h-16 text-purple-500 mx-auto" />
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
    <div className="relative h-[600px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 overflow-hidden rounded-3xl group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentImage.image_url}
          alt={currentImage.prompt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2">
                    Community Gallery
                  </h1>
                  <p className="text-white/80 text-lg">
                    Discover amazing AI creations from our talented community
                  </p>
                </div>
              </div>
            </div>

            {/* Current Image Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {currentImage.avatar_url ? (
                    <img
                      src={currentImage.avatar_url}
                      alt={currentImage.display_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {currentImage.display_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{currentImage.display_name}</p>
                  <p className="text-white/60 text-sm">@{currentImage.username}</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                  "{currentImage.prompt}"
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                    {currentImage.model_used}
                  </Badge>
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {currentImage.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {currentImage.views_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/gallery">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
                  <Palette className="h-4 w-4 mr-2" />
                  Explore Full Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      {autoPlay && (
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="text-white border-white/30 bg-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Auto-playing
          </Badge>
        </div>
      )}
    </div>
  )
} 