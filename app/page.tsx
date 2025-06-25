"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Zap, Shield, GalleryThumbnailsIcon as Gallery, ArrowRight, Sparkles, ExternalLink, Mail, Phone, MapPin, Clock } from "lucide-react"
import { AutoSlidingGallery } from "@/components/gallery/auto-sliding-gallery"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user } = useAuth()
  return (
    <div className="space-y-16">
      {/* Community Gallery Slider */}
      <section className="py-8">
        <AutoSlidingGallery />
      </section>

      {/* Features Section */}
      

      {/* CTA Section - Only for non-logged-in users */}
      {!user && (
        <section className="text-center space-y-6 py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl">
          <h2 className="text-3xl font-bold">Ready to Start Creating?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Let's use AICCORE Image Studio to generate stunning visuals
          </p>
          <Link href="/auth">
            <Button size="lg" className="px-8">
              Start Generating Now
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      )}

      {/* AICCORE Contact Section - Always visible for all users with full content */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl">
        <div className="text-center mb-8">
          {/* Community Gallery Description */}
          <div className="mb-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              The images you see in our community gallery above are incredible AI-generated artworks created by talented students who participated in our NextGen AI Studio program. These showcase the amazing creativity and technical skills our participants developed during their journey with us.
            </p>
          </div>
          
          {/* NextGen AI Studio Event */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl border-2 border-purple-200 dark:border-purple-700">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              NextGen AI Studio
            </h2>
            <p className="text-xl font-semibold text-purple-700 dark:text-purple-300">
              June 23 - August 1, 2025
            </p>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Let's Connect with AICCORE</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Artificial Intelligence Center for Collaborative Outreach, Research, and Education
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <a href="mailto:unoaiccore@unomaha.edu" className="text-blue-600 hover:underline">
                  unoaiccore@unomaha.edu
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <a href="tel:+14023215488" className="text-blue-600 hover:underline">
                  +1 (402) 321-5488
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p>PKI 1110 S 67th St</p>
                  <p>Omaha, NE 68182</p>
                  <p>United States</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <p>Mon-Fri: 9:00 AM - 6:00 PM CST</p>
              </div>
            </CardContent>
          </Card>

          {/* Online Presence */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-purple-600" />
                Connect Online
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <a
                  href="https://aiccore-uno.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">aiccore-uno.ai</span>
                </a>
                
                <a
                  href="https://www.linkedin.com/company/ai-ccore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">LinkedIn @ai-ccore</span>
                </a>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 text-center">
                  © 2025 AI-CCORE. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
