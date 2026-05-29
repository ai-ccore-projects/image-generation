"use client"

import { useState, useEffect } from 'react'
import { Trash2, Download, Clock, AlertTriangle, RefreshCw, Upload as UploadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

interface UploadedImage {
  name: string
  url: string
  created_at: string
  size: number
  metadata?: any
}

export function UploadedImages() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchUploadedImages()
    }
  }, [user])

  const fetchUploadedImages = async () => {
    try {
      setIsLoading(true)
      const { getSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .list(user?.id || '', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error('Error fetching uploaded images:', error)
        toast({
          title: "Error",
          description: "Failed to load uploaded images.",
          variant: "destructive",
        })
        return
      }

      const imageList: UploadedImage[] = []
      
      for (const file of data || []) {
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(`${user?.id}/${file.name}`)
        
        imageList.push({
          name: file.name,
          url: publicUrl,
          created_at: file.created_at || new Date().toISOString(),
          size: file.metadata?.size || 0,
          metadata: file.metadata
        })
      }

      setImages(imageList)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to load uploaded images.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteImage = async (imageName: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return
    }

    setDeletingImages(prev => new Set([...prev, imageName]))
    
    try {
      const { getSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = getSupabaseClient()
      
      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([`${user?.id}/${imageName}`])

      if (error) {
        throw error
      }

      setImages(prev => prev.filter(img => img.name !== imageName))
      
      toast({
        title: "Image Deleted",
        description: "The image has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageName)
        return newSet
      })
    }
  }

  const downloadImage = async (imageUrl: string, imageName: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = imageName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download Started",
        description: "Your image download has started.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the image.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt)
    const deletionTime = new Date(created.getTime() + 24 * 60 * 60 * 1000) // 24 hours from creation
    const now = new Date()
    const remaining = deletionTime.getTime() - now.getTime()
    
    if (remaining <= 0) {
      return "Expired"
    }
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m remaining`
  }

  const isExpired = (createdAt: string) => {
    const created = new Date(createdAt)
    const deletionTime = new Date(created.getTime() + 24 * 60 * 60 * 1000)
    return new Date() > deletionTime
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">Please Log In</h3>
        <p className="text-gray-500">You need to be logged in to view your uploaded images.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Uploaded Images
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your uploaded profile images</p>
      </div>

      {/* Auto-deletion Warning */}
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <strong>Auto-Deletion Policy:</strong> Images in this tab (profile photos) are automatically deleted after 24 hours. 
          <br/>
          <strong>⚠️ IMPORTANT:</strong> This ONLY affects uploaded profile photos. Your AI-generated images in "My Gallery" are permanent and will NOT be deleted.
          <br/>
          Download any profile photos you want to keep before they expire.
        </AlertDescription>
      </Alert>

      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? 'Loading...' : `${images.length} image(s) found`}
        </div>
        <Button 
          onClick={fetchUploadedImages} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">No Images Found</h3>
          <p className="text-gray-500 mb-6">You haven't uploaded any images yet.</p>
          <p className="text-sm text-gray-400">Upload images through your profile settings to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image) => {
            const expired = isExpired(image.created_at)
            const timeRemaining = getTimeRemaining(image.created_at)
            const isDeleting = deletingImages.has(image.name)
            
            return (
              <Card key={image.name} className={`overflow-hidden transition-all duration-300 ${expired ? 'opacity-50 border-red-300' : 'hover:shadow-lg'}`}>
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder.svg'
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge 
                      variant={expired ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {expired ? "Expired" : timeRemaining}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                      onClick={() => downloadImage(image.url, image.name)}
                      disabled={expired}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-8 h-8 p-0 bg-red-500/80 hover:bg-red-600"
                      onClick={() => deleteImage(image.name)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm truncate" title={image.name}>
                      {image.name}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatFileSize(image.size)}</span>
                      <span>{new Date(image.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 