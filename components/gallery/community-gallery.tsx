"use client"

import { useState, useEffect } from 'react'
import { Share2, Filter, Search, Grid, List, Calendar, Sparkles, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

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

export function CommunityGallery() {
  const [images, setImages] = useState<CommunityImage[]>([])
  const [filteredImages, setFilteredImages] = useState<CommunityImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterModel, setFilterModel] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())
  const [selectedImage, setSelectedImage] = useState<CommunityImage | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [sortBy, sortOrder])

  useEffect(() => {
    filterImages()
  }, [images, searchTerm, filterModel])

  useEffect(() => {
    // Listen for community gallery refresh events
    const handleRefresh = () => {
      fetchImages()
    }
    
    // Check if window is available (browser environment)
    if (typeof window !== "undefined") {
      window.addEventListener('refreshCommunityGallery', handleRefresh)
      return () => window.removeEventListener('refreshCommunityGallery', handleRefresh)
    }
  }, [])

  // Handle keyboard navigation in modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalOpen) return
      
      if (e.key === 'Escape') {
        closeModal()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateModal('prev')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateModal('next')
      }
    }

    if (typeof document !== "undefined") {
      if (modalOpen) {
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden' // Prevent background scrolling
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [modalOpen, selectedImage])

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/gallery/public?sort_by=${sortBy}&sort_order=${sortOrder}&limit=50`)
      const data = await response.json()
      if (data.images) {
        setImages(data.images)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterImages = () => {
    let filtered = [...images]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(image => 
        image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.model_used.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by model
    if (filterModel !== 'all') {
      filtered = filtered.filter(image => image.model_used === filterModel)
    }

    setFilteredImages(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const uniqueModels = Array.from(new Set(images.map(img => img.model_used)))

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
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
    let newIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length
    }
    
    setSelectedImage(filteredImages[newIndex])
  }

  const handleShare = async (image: CommunityImage) => {
    // Check if window is available (browser environment)
    if (typeof window === "undefined") return

    const shareUrl = `${window.location.origin}/gallery?image=${image.id}`
    const shareText = `Check out this amazing AI-generated artwork by ${image.display_name || image.username}: "${image.prompt}"`

    try {
      // Try using native Web Share API first (mobile-friendly)
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `AI Art by ${image.display_name || image.username}`,
          text: shareText,
          url: shareUrl,
        })
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        
        // Show a temporary notification
        if (typeof document !== "undefined") {
          const notification = document.createElement('div')
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300'
          notification.textContent = '✅ Link copied to clipboard!'
          document.body.appendChild(notification)
          
          // Remove notification after 3 seconds
          setTimeout(() => {
            notification.style.opacity = '0'
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification)
              }
            }, 300)
          }, 3000)
        }
      } else {
        // Last resort: use alert
        alert(`Share this link: ${shareUrl}`)
      }
    } catch (error) {
      console.error('Share failed:', error)
      
      // Fallback fallback: try copying just the URL
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl)
          alert('Link copied to clipboard!')
        } else {
          // Last resort: prompt user to copy manually
          if (typeof window !== "undefined") {
            prompt('Copy this link to share:', shareUrl)
          }
        }
      } catch (clipboardError) {
        // Last resort: prompt user to copy manually
        if (typeof window !== "undefined") {
          prompt('Copy this link to share:', shareUrl)
        }
      }
    }
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredImages.map((image) => (
        <Card key={image.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => openModal(image)}>
            <img
              src={image.image_url}
              alt={image.prompt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                setImageLoadErrors(prev => new Set([...prev, image.id]))
                // Create a custom placeholder
                target.style.display = 'none'
                const placeholder = document.createElement('div')
                placeholder.className = 'w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'
                placeholder.innerHTML = `
                  <div class="text-center text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm font-medium">Image Unavailable</p>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare(image)
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Model Badge */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10 text-xs">
                {image.model_used}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              {/* User Info */}
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
                        target.parentElement?.appendChild(
                          Object.assign(document.createElement('div'), {
                            className: 'h-4 w-4 text-white',
                            innerHTML: '<svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>'
                          })
                        )
                      }}
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{image.display_name || image.username || 'Anonymous Artist'}</p>
                  <p className="text-gray-500 text-xs">{formatDate(image.created_at)}</p>
                </div>
              </div>

              {/* Prompt */}
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                "{image.prompt}"
              </p>

              {/* Model Info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <Badge variant="outline" className="text-xs">
                  {image.model_used}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(image.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Community Gallery
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Discover incredible AI-generated artwork from our creative community. Get inspired, share your own creations, and connect with fellow artists.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search prompts, artists, or models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/20"
                />
              </div>

              {/* Model Filter */}
              <Select value={filterModel} onValueChange={setFilterModel}>
                <SelectTrigger className="w-48 bg-white/50 border-white/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {uniqueModels.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-')
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}>
                <SelectTrigger className="w-48 bg-white/50 border-white/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Latest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode & Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchImages}
                disabled={isLoading}
                className="gap-1 bg-white/50 border-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center gap-2 bg-white/50 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="gap-1"
                >
                  <Grid className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="gap-1"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>
              {isLoading ? 'Loading...' : `${filteredImages.length} of ${images.length} images`}
            </span>
            <span>Showcasing our creative community</span>
          </div>
        </div>

        {/* Images Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading community gallery...</p>
            </div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">No images found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <Button onClick={() => {
              setSearchTerm('')
              setFilterModel('all')
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <GridView />
        )}

        {/* Image Modal */}
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
                ✕
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
                  {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
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
    </div>
  )
} 