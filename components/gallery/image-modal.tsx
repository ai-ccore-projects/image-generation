"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Download, Trash2, Calendar, Settings, Share2, Globe, Lock } from "lucide-react"
import { MODEL_CONFIGS } from "@/lib/ai-models"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import type { GeneratedImage } from "@/lib/types"

interface ImageModalProps {
  image: GeneratedImage
  onClose: () => void
  onDelete: (id: string) => void
}

export function ImageModal({ image, onClose, onDelete }: ImageModalProps) {
  const { toast } = useToast()
  const modelConfig = MODEL_CONFIGS[image.model_used as keyof typeof MODEL_CONFIGS]
  const [isPublic, setIsPublic] = useState(image.is_public || false)
  const [isUpdatingShare, setIsUpdatingShare] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(image.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${image.model_used}-${image.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this image?")) {
      onDelete(image.id)
    }
  }

  const handleShareToggle = async (checked: boolean) => {
    setIsUpdatingShare(true)
    try {
      // Get the current session
      const { getSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = getSupabaseClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/gallery/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          imageId: image.id,
          isPublic: checked,
          userId: session.user.id,
        }),
      })

      if (response.ok) {
        setIsPublic(checked)
        toast({
          title: checked ? "Image shared!" : "Image made private",
          description: checked 
            ? "Your image is now visible in the community gallery." 
            : "Your image has been removed from the community gallery.",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update sharing status')
      }
    } catch (error: any) {
      console.error('Share toggle error:', error)
      toast({
        title: "Share update failed",
        description: error.message || "Could not update the sharing status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingShare(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${modelConfig?.color || "bg-gray-500"}`} />
            {modelConfig?.name || image.model_used}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <img
              src={image.image_url || "/placeholder.svg"}
              alt={image.prompt}
              className="w-full rounded-lg shadow-lg"
            />

            <div className="space-y-3">
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleDelete} variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Sharing Toggle */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                      {isPublic ? (
                        <Globe className="h-4 w-4 text-white" />
                      ) : (
                        <Lock className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {isPublic ? "Public" : "Private"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isPublic 
                          ? "Visible in community gallery" 
                          : "Only visible to you"
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={handleShareToggle}
                    disabled={isUpdatingShare}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Original Prompt</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                {image.prompt}
              </p>
            </div>

            {image.revised_prompt && image.revised_prompt !== image.prompt && (
              <div>
                <h3 className="font-semibold mb-2">Revised Prompt</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {image.revised_prompt}
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{new Date(image.created_at).toLocaleString()}</span>
              </div>

              {image.generation_params && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Generation Parameters</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {image.generation_params.size && <Badge variant="outline">{image.generation_params.size}</Badge>}
                    {image.generation_params.quality && (
                      <Badge variant="outline">{image.generation_params.quality}</Badge>
                    )}
                    {image.generation_params.style && <Badge variant="outline">{image.generation_params.style}</Badge>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
