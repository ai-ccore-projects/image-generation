"use client"

import { useState, useEffect } from 'react'
import { Share2, Filter, Search, Grid, List, Calendar, Sparkles, RefreshCw, User, Wand2, Copy, Eye, Edit, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'

interface SavedPrompt {
  id: string
  title: string
  original_prompt: string
  enhanced_prompt?: string
  created_at: string
  updated_at: string
  user_id: string
  is_public: boolean
  tags?: string[]
  username?: string
  display_name?: string
  avatar_url?: string
}

export function PromptGallery() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<SavedPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewType, setViewType] = useState<'original' | 'enhanced'>('original')
  const [copied, setCopied] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchPrompts()
  }, [sortBy, sortOrder, user])

  useEffect(() => {
    filterPrompts()
  }, [prompts, searchTerm, filterType])

  const fetchPrompts = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const response = await fetch('/api/prompts/save', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      const result = await response.json()
      if (result.success) {
        setPrompts(result.prompts || [])
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPrompts = () => {
    let filtered = [...prompts]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.original_prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prompt.enhanced_prompt && prompt.enhanced_prompt.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by type
    if (filterType === 'enhanced') {
      filtered = filtered.filter(prompt => prompt.enhanced_prompt)
    } else if (filterType === 'original') {
      filtered = filtered.filter(prompt => !prompt.enhanced_prompt)
    }

    setFilteredPrompts(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const openModal = (prompt: SavedPrompt) => {
    setSelectedPrompt(prompt)
    setViewType(prompt.enhanced_prompt ? 'enhanced' : 'original')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedPrompt(null)
    setCopied(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (prompt: SavedPrompt) => {
    const shareText = `Check out this portfolio prompt: "${prompt.title}"`
    const shareUrl = `${window.location.origin}/prompt-generator`

    try {
      if (navigator.share) {
        await navigator.share({
          title: prompt.title,
          text: shareText,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300'
        notification.textContent = '✅ Link copied to clipboard!'
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.style.opacity = '0'
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 300)
        }, 3000)
      }
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPrompts.map((prompt) => (
        <Card key={prompt.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2 mb-2">{prompt.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {formatDate(prompt.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {prompt.enhanced_prompt && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                    Enhanced
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Prompt Preview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {prompt.enhanced_prompt ? prompt.enhanced_prompt.substring(0, 150) + '...' : prompt.original_prompt.substring(0, 150) + '...'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openModal(prompt)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Full
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(prompt.enhanced_prompt || prompt.original_prompt)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShare(prompt)}
                    className="flex items-center gap-1"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const ListView = () => (
    <div className="space-y-4">
      {filteredPrompts.map((prompt) => (
        <Card key={prompt.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold truncate">{prompt.title}</h3>
                  {prompt.enhanced_prompt && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Enhanced
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {prompt.enhanced_prompt ? prompt.enhanced_prompt.substring(0, 200) + '...' : prompt.original_prompt.substring(0, 200) + '...'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(prompt.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openModal(prompt)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(prompt.enhanced_prompt || prompt.original_prompt)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleShare(prompt)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Prompt Gallery
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Explore your saved portfolio prompts. View, edit, and reuse your comprehensive project briefs for future development.
          </p>
        </div>

        {!user ? (
          <div className="text-center py-20">
            <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">Sign in to view your prompts</h3>
            <p className="text-gray-500 mb-6">Create an account to save and manage your portfolio prompts</p>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search prompts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 border-white/20"
                    />
                  </div>

                  {/* Type Filter */}
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48 bg-white/50 border-white/20">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prompts</SelectItem>
                      <SelectItem value="enhanced">AI Enhanced</SelectItem>
                      <SelectItem value="original">Original Only</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split('-')
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}>
                    <SelectTrigger className="w-48 bg-white/50 border-white/20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at-desc">Latest First</SelectItem>
                      <SelectItem value="created_at-asc">Oldest First</SelectItem>
                      <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode & Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchPrompts}
                    disabled={isLoading}
                    className="gap-1 bg-white/50 border-white/20"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <div className="flex items-center gap-2 bg-white/50 rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                      className="gap-1"
                    >
                      <Grid className="h-4 w-4" />
                      Grid
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                      className="gap-1"
                    >
                      <List className="h-4 w-4" />
                      List
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>
                  {isLoading ? 'Loading...' : `${filteredPrompts.length} of ${prompts.length} prompts`}
                </span>
                <span>Your portfolio prompt collection</span>
              </div>
            </div>

            {/* Prompts Display */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-300">Loading your prompts...</p>
                </div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-20">
                <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                  {prompts.length === 0 ? 'No prompts yet' : 'No prompts found'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {prompts.length === 0 ? 'Create your first portfolio prompt to get started' : 'Try adjusting your search or filters'}
                </p>
                {prompts.length === 0 && (
                  <Button asChild>
                    <a href="/prompt-generator">Create Your First Prompt</a>
                  </Button>
                )}
                {prompts.length > 0 && (
                  <Button onClick={() => {
                    setSearchTerm('')
                    setFilterType('all')
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              viewMode === 'grid' ? <GridView /> : <ListView />
            )}
          </>
        )}

        {/* Prompt Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-tight break-words min-w-0 flex-1 max-w-full sm:max-w-[60%]">
                    {selectedPrompt?.title}
                  </h2>
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedPrompt?.enhanced_prompt && (
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant={viewType === 'original' ? 'default' : 'ghost'}
                          onClick={() => setViewType('original')}
                        >
                          Original
                        </Button>
                        <Button
                          size="sm"
                          variant={viewType === 'enhanced' ? 'default' : 'ghost'}
                          onClick={() => setViewType('enhanced')}
                        >
                          Enhanced
                        </Button>
                      </div>
                    )}
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(
                        viewType === 'enhanced' && selectedPrompt?.enhanced_prompt 
                          ? selectedPrompt.enhanced_prompt 
                          : selectedPrompt?.original_prompt || ''
                      )}
                      className="gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh]">
              <Textarea
                value={
                  viewType === 'enhanced' && selectedPrompt?.enhanced_prompt 
                    ? selectedPrompt.enhanced_prompt 
                    : selectedPrompt?.original_prompt || ''
                }
                readOnly
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
              <span>Created: {selectedPrompt && formatDate(selectedPrompt.created_at)}</span>
              {selectedPrompt?.enhanced_prompt && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  AI Enhanced
                </Badge>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 