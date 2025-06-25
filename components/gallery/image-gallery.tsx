"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { ImageCard } from "./image-card"
import { GalleryFilters } from "./gallery-filters"
import { ImageModal } from "./image-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Images } from "lucide-react"
import { SharingPrompt } from "./sharing-prompt"
import type { GeneratedImage } from "@/lib/types"

export function ImageGallery() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [filters, setFilters] = useState({
    model: "",
    search: "",
    dateRange: "",
  })
  const [showSharingPrompt, setShowSharingPrompt] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchImages()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [images, filters])

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setImages(data || [])
      
      // Check if user has any shared images
      const hasSharedImages = data?.some(img => img.is_public) || false
      if (!hasSharedImages && data && data.length > 0) {
        setShowSharingPrompt(true)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...images]

    if (filters.model && filters.model !== "all") {
      filtered = filtered.filter((img) => img.model_used === filters.model)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (img) =>
          img.prompt.toLowerCase().includes(searchLower) || img.revised_prompt?.toLowerCase().includes(searchLower),
      )
    }

    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date()
      const days = Number.parseInt(filters.dateRange)
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((img) => new Date(img.created_at) >= cutoff)
    }

    setFilteredImages(filtered)
  }

  const handleDelete = async (imageId: string) => {
    try {
      const { error } = await supabase.from("generated_images").delete().eq("id", imageId)

      if (error) throw error

      setImages((prev) => prev.filter((img) => img.id !== imageId))
      setSelectedImage(null)
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Gallery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Browse and manage your generated images</p>
      </div>

      <GalleryFilters filters={filters} onFiltersChange={setFilters} />

      {showSharingPrompt && (
        <SharingPrompt onDismiss={() => setShowSharingPrompt(false)} />
      )}

      {filteredImages.length === 0 ? (
        <Alert>
          <Images className="h-4 w-4" />
          <AlertDescription>
            {images.length === 0
              ? "You haven't generated any images yet. Visit the Model Arena to get started!"
              : "No images match your current filters."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <ImageCard key={image.id} image={image} onClick={() => setSelectedImage(image)} />
          ))}
        </div>
      )}

      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} onDelete={handleDelete} />
      )}
    </div>
  )
}
