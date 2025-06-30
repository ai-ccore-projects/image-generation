"use client"

import { useState, useEffect } from 'react'
import { Globe, ExternalLink, Calendar, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Portfolio {
  id: string
  title: string
  description: string
  website_url: string | null
  screenshot_urls: string[]
  created_at: string
  is_deployed?: boolean
}

export function PortfolioShowcase() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchPortfolios()
  }, [])

  useEffect(() => {
    if (portfolios.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % portfolios.length)
      }, 5000) // Change every 5 seconds

      return () => clearInterval(interval)
    }
  }, [portfolios.length])

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/portfolio/upload?public=true&limit=10')
      const result = await response.json()
      if (result.success && result.portfolios.length > 0) {
        setPortfolios(result.portfolios)
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + portfolios.length) % portfolios.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % portfolios.length)
  }

  if (isLoading) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading portfolio showcase...</p>
          </div>
        </div>
      </div>
    )
  }

  if (portfolios.length === 0) {
    return (
      <div className="relative h-[600px] bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Portfolio Showcase
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Real portfolios from our community
              </p>
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="absolute top-8 right-8 z-20">
          <Button variant="outline" size="sm" asChild className="bg-white/20 border-white/30 text-gray-700 dark:text-gray-300 hover:bg-white/30">
            <a href="/portfolio-gallery">View All →</a>
          </Button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Globe className="w-16 h-16 text-blue-500 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Portfolio Showcase Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Be the first to share your portfolio with the community!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentPortfolio = portfolios[currentIndex]

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Header */}
      <div className="absolute top-8 left-8 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Portfolio Showcase
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Real portfolios from our community
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {portfolios.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Portfolio Content */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* Portfolio Preview */}
          <div className="relative">
            <div className="aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden">
              {currentPortfolio.screenshot_urls.length > 0 ? (
                <img
                  src={currentPortfolio.screenshot_urls[0]}
                  alt={currentPortfolio.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <Camera className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-lg font-medium">Portfolio Preview</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Screenshot count indicator */}
            {currentPortfolio.screenshot_urls.length > 1 && (
              <div className="absolute bottom-4 right-4">
                <Badge className="bg-black/50 text-white">
                  {currentPortfolio.screenshot_urls.length} images
                </Badge>
              </div>
            )}
          </div>

          {/* Portfolio Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
                {currentPortfolio.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {currentPortfolio.description || 'A beautiful portfolio showcasing professional work and achievements.'}
              </p>
            </div>

            <div className="space-y-3">
              {currentPortfolio.website_url ? (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Globe className="h-5 w-5" />
                  <span className="font-mono text-sm">
                    {currentPortfolio.website_url.replace(/^https?:\/\//, '')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm italic">
                    Portfolio not yet deployed
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">
                  Created {formatDate(currentPortfolio.created_at)}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              {currentPortfolio.website_url ? (
                <Button
                  onClick={() => window.open(currentPortfolio.website_url!, '_blank')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Portfolio
                </Button>
              ) : (
                <Button
                  disabled
                  className="bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Not Yet Deployed
                </Button>
              )}
              <Button variant="outline" asChild>
                <a href="/portfolio-gallery">View All Portfolios</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      {portfolios.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {portfolios.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      <div className="absolute top-8 right-8 z-20">
        <Button variant="outline" size="sm" asChild className="bg-white/20 border-white/30 text-white hover:bg-white/30">
          <a href="/portfolio-gallery">View All →</a>
        </Button>
      </div>
    </div>
  )
} 