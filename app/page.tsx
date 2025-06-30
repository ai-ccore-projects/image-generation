"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Mail, Phone, MapPin, Clock, Sparkles, Wand2 } from "lucide-react"
import { AutoSlidingGallery } from "@/components/gallery/auto-sliding-gallery"
import { PortfolioShowcase } from "@/components/gallery/portfolio-showcase"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section with Two Main Cards */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AICCORE NextGen AI Studio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Unleash your creativity with our powerful AI tools. Generate stunning images or create comprehensive portfolio prompts with ease.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Studio Card */}
          <Link href="/dashboard">
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Image Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Transform your ideas into stunning visuals with multiple AI models
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>5+ AI Models Available</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span>High-Quality Image Generation</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Model Comparison Tools</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span>Community Gallery</span>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full group-hover:from-blue-700 group-hover:to-cyan-700 transition-all duration-300">
                    <span className="font-semibold">Launch Studio</span>
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Prompt Generator Card */}
          <Link href="/prompt-generator">
            <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Wand2 className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Portfolio Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Complete portfolio development toolkit with AI-enhanced prompts and showcase gallery
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>AI-Enhanced Prompts</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Prompt Gallery & Management</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Portfolio Showcase</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Professional Briefs</span>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-300">
                    <span className="font-semibold">Enter Studio</span>
                    <Wand2 className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Community Gallery Slider */}
      <section className="py-8">
        <AutoSlidingGallery />
      </section>

      {/* Portfolio Showcase */}
      <section className="py-8">
        <PortfolioShowcase />
      </section>

      {/* Features Section */}
      

      {/* AICCORE Contact Section - Always visible for all users with full content */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl">
        <div className="text-center mb-8">
          {/* Community Gallery Description */}
          <div className="mb-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              The creative works you see in our community galleries above are incredible AI-generated artworks and professional portfolios created by talented students who participated in our NextGen AI Studio program. These showcase the amazing creativity, technical skills, and professional development our participants achieved during their journey with us.
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
