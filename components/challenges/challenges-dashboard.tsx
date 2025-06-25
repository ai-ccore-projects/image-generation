"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageRecreationChallenge } from "./image-recreation-challenge"
import { LinkedInProfileChallenge } from "./linkedin-profile-challenge"
import { Card, CardContent } from "@/components/ui/card"
import { Image, Briefcase, Trophy, Target, Sparkles } from "lucide-react"

export function ChallengesDashboard() {
  const [activeTab, setActiveTab] = useState("image-recreation")

  // Persistence: Load saved tab on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem('aiccore-challenges-active-tab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  // Save tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aiccore-challenges-active-tab', activeTab)
  }, [activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-3xl" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
            <Sparkles className="h-4 w-4" />
             Image Generation Excercises
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Level Up Your Skills
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Take on  aiccore  exciting challenges to improve your AI image generation skills and build your  profile  . 
            Compete, learn with our interactive image challenge .
          </p>

          {/* Stats Cards */}
          
        </div>
      </div>

      {/* Main Challenge Tabs */}
      <div className="container mx-auto px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-white/10 backdrop-blur-sm border border-white/20 h-14">
            <TabsTrigger 
              value="image-recreation" 
              className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Image className="h-4 w-4 mr-2" />
              Exercise 1
            </TabsTrigger>
            <TabsTrigger 
              value="linkedin-profile" 
              className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Exercise 2
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image-recreation" className="mt-0">
            <ImageRecreationChallenge />
          </TabsContent>

          <TabsContent value="linkedin-profile" className="mt-0">
            <LinkedInProfileChallenge />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
