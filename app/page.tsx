"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Zap, Shield, GalleryThumbnailsIcon as Gallery, ArrowRight, Sparkles, ExternalLink, Mail, Phone, MapPin, Clock } from "lucide-react"
import { AutoSlidingGallery } from "@/components/gallery/auto-sliding-gallery"
import { useAuth } from "@/contexts/auth-context"
import { AutoSlidingGallerySimple } from '@/components/gallery/auto-sliding-gallery-simple'

export default function HomePage() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-white/20 text-sm font-medium text-purple-700 dark:text-purple-300 mb-6">
            <Sparkles className="h-4 w-4" />
            Next-Generation AI Image Creation
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Create Stunning 
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Images
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience the power of multiple AI models in one platform. Generate, compare, and perfect your images with cutting-edge technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg">
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2">
                Explore Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to create amazing AI-generated images
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Multiple AI Models</CardTitle>
                <CardDescription>
                  Choose from DALL-E 3, Midjourney, Stable Diffusion, and more cutting-edge models
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Smart Comparisons</CardTitle>
                <CardDescription>
                  Compare results from different models side-by-side to find the perfect image
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Community Gallery</CardTitle>
                <CardDescription>
                  Share your creations and discover amazing artwork from other creators
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Gallery Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              Community Showcase
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover incredible AI-generated artwork from our community
            </p>
          </div>
          
          {/* Auto-sliding Gallery */}
          <AutoSlidingGallerySimple />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-600/20 dark:to-blue-600/20 rounded-3xl p-12 border border-purple-200/30 dark:border-purple-700/30">
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of creators already using our platform to bring their ideas to life
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
