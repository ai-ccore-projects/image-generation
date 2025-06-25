"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, Users, Heart, Eye, Sparkles, Globe, Gift } from 'lucide-react'

interface SharingPromptProps {
  onDismiss: () => void
}

export function SharingPrompt({ onDismiss }: SharingPromptProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  if (!isVisible) return null

  return (
    <Card className="border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">Share Your First Creation!</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Join our creative community by sharing your AI-generated artwork! When you share images, you can:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Connect with Artists</p>
              <p className="text-xs text-gray-500">Discover and inspire others</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Get Likes & Feedback</p>
              <p className="text-xs text-gray-500">Receive appreciation for your work</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Gain Visibility</p>
              <p className="text-xs text-gray-500">Showcase your creativity</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Inspire Others</p>
              <p className="text-xs text-gray-500">Help the community learn</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm">How to Share</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Simply open any image in your gallery and toggle the sharing switch to make it visible in the community gallery.
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/50">
              <Gift className="h-3 w-3 mr-1" />
              Free Feature
            </Badge>
            <Badge variant="outline" className="bg-white/50">
              <Users className="h-3 w-3 mr-1" />
              Community
            </Badge>
          </div>
          <Button onClick={handleDismiss} variant="outline" size="sm">
            Got it!
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 