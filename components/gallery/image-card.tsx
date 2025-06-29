"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MODEL_CONFIGS } from "@/lib/ai-models"
import type { GeneratedImage } from "@/lib/types"

interface ImageCardProps {
  image: GeneratedImage
  onClick: () => void
}

export function ImageCard({ image, onClick }: ImageCardProps) {
  const modelConfig = MODEL_CONFIGS[image.model_used as keyof typeof MODEL_CONFIGS]

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group" onClick={onClick}>
      <div className="aspect-square relative">
        <img
          src={image.image_url || "/placeholder.svg"}
          alt={image.prompt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {modelConfig?.name || image.model_used}
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{image.prompt}</p>
        <p className="text-xs text-gray-500 mt-1">{new Date(image.created_at).toLocaleDateString()}</p>
      </div>
    </Card>
  )
}
