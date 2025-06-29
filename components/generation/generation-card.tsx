"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Download, Save, AlertCircle, X, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import type { GenerationParams } from "@/lib/types"

interface GenerationCardProps {
  model: string
  config: {
    name: string
    description: string
    color: string
  }
  result?: {
    result?: { url: string; revised_prompt?: string }
    error?: any
    loading?: boolean
  }
  prompt: string
  params: GenerationParams
}

export function GenerationCard({ model, config, result, prompt, params }: GenerationCardProps) {
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

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

  const openModal = () => {
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  const handleSave = async () => {
    if (!result?.result || !user) return

    setSaving(true)
    try {
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: result.result.url,
          prompt,
          modelUsed: model,
          revisedPrompt: result.result.revised_prompt,
          generationParams: params,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save image')
      }

      const data = await response.json()

      toast({
        title: "Image saved!",
        description: "The image has been uploaded to Supabase Storage and added to your gallery.",
      })
    } catch (error: any) {
      console.error('Save error:', error)
      toast({
        title: "Error saving image",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!result?.result?.url) return

    try {
      const response = await fetch(result.result.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${model}-${Date.now()}.jpg`
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
            {config.name}
          </CardTitle>
          {result?.loading && (
            <Badge variant="secondary" className="animate-pulse">
              Generating...
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {result?.loading ? (
            <Skeleton className="w-full h-full" />
          ) : result?.error ? (
            <div className="w-full h-full flex items-center justify-center text-red-500">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Generation failed</p>
              </div>
            </div>
          ) : result?.result ? (
            <img 
              src={result.result.url || "/placeholder.svg"} 
              alt={prompt} 
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200" 
              onClick={openModal}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <p className="text-sm">Waiting for generation...</p>
            </div>
          )}
        </div>

        {result?.result && (
          <div className="space-y-3">
            {result.result.revised_prompt && result.result.revised_prompt !== prompt && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Revised Prompt:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                  {result.result.revised_prompt}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1">
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Full Size Image Modal */}
      <AnimatePresence>
        {modalOpen && result?.result && (
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
                  {config.name}
                </Badge>
              </div>

              {/* Full Size Image */}
              <img
                src={result.result.url}
                alt={prompt}
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
                      {config.name}
                    </p>
                    <p className="text-white/80 text-xs">
                      AI Generated Image
                    </p>
                  </div>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  "{prompt}"
                </p>
                {result.result.revised_prompt && result.result.revised_prompt !== prompt && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs text-white/70 mb-1">Revised Prompt:</p>
                    <p className="text-xs text-white/90 leading-relaxed">
                      "{result.result.revised_prompt}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
