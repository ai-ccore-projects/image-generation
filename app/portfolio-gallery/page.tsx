"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioGallery } from "@/components/gallery/portfolio-gallery"
import { Globe, User } from 'lucide-react'

export default function PortfolioGalleryPage() {
  const [activeTab, setActiveTab] = useState("community")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-6 py-8">
        {/* Main Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Portfolio Gallery
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Discover amazing portfolio websites and manage your own collection
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger 
              value="community" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Globe className="h-4 w-4" />
              Community Gallery
            </TabsTrigger>
            <TabsTrigger 
              value="my-portfolio" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4" />
              My Portfolio Gallery
            </TabsTrigger>
          </TabsList>

          {/* Community Portfolio Gallery Tab */}
          <TabsContent value="community" className="mt-0">
            <PortfolioGallery 
              showPublicOnly={true}
              mode="community"
              title="Community Portfolio Gallery"
              description="Discover stunning portfolio websites created by our community. Get inspired by real projects, see different design approaches, and explore professional presentations."
            />
          </TabsContent>

          {/* My Portfolio Gallery Tab */}
          <TabsContent value="my-portfolio" className="mt-0">
            <PortfolioGallery 
              showPublicOnly={false}
              mode="personal"
              title="My Portfolio Gallery"
              description="Manage your portfolio collection. Edit details, replace screenshots, delete portfolios, and control privacy settings."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 