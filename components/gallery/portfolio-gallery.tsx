"use client"

import { useState, useEffect } from 'react'
import { Share2, Filter, Search, Grid, List, Calendar, Globe, RefreshCw, User, ExternalLink, Copy, Eye, Camera, Edit, Trash2, Upload, Save, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'

interface Portfolio {
  id: string
  title: string
  description: string
  website_url: string
  screenshot_urls: string[]
  screenshot_count: number
  tags?: string[]
  is_public: boolean
  created_at: string
  updated_at: string
  user_id: string
  prompt_id?: string
  username?: string
  display_name?: string
  avatar_url?: string
}

interface PortfolioGalleryProps {
  showPublicOnly?: boolean
  mode?: 'community' | 'personal'
  title?: string
  description?: string
}

export function PortfolioGallery({ 
  showPublicOnly = false, 
  mode = 'community',
  title = "Portfolio Gallery",
  description = "Explore stunning portfolio websites created by our community. Get inspired by real projects and professional presentations."
}: PortfolioGalleryProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Edit functionality states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    website_url: '',
    is_public: false
  })
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchPortfolios()
  }, [sortBy, sortOrder, user, showPublicOnly])

  useEffect(() => {
    filterPortfolios()
  }, [portfolios, searchTerm, filterType])

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        limit: '50',
        ...(showPublicOnly ? { public: 'true' } : {})
      })

      const headers: Record<string, string> = {}
      
      if (!showPublicOnly && user) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
      }

      const response = await fetch(`/api/portfolio/upload?${params}`, {
        headers
      })

      const result = await response.json()
      if (result.success) {
        setPortfolios(result.portfolios || [])
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPortfolios = () => {
    let filtered = [...portfolios]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(portfolio => 
        portfolio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        portfolio.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        portfolio.website_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (portfolio.tags && portfolio.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    // Filter by type (could add more filters like linked to prompts, etc.)
    if (filterType === 'with_prompts') {
      filtered = filtered.filter(portfolio => portfolio.prompt_id)
    } else if (filterType === 'without_prompts') {
      filtered = filtered.filter(portfolio => !portfolio.prompt_id)
    }

    setFilteredPortfolios(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const openModal = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setCurrentImageIndex(0)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedPortfolio(null)
    setCurrentImageIndex(0)
  }

  const navigateModal = (direction: 'prev' | 'next') => {
    if (!selectedPortfolio) return
    
    const currentIndex = filteredPortfolios.findIndex(p => p.id === selectedPortfolio.id)
    let newIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredPortfolios.length
    } else {
      newIndex = (currentIndex - 1 + filteredPortfolios.length) % filteredPortfolios.length
    }
    
    setSelectedPortfolio(filteredPortfolios[newIndex])
    setCurrentImageIndex(0)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedPortfolio || selectedPortfolio.screenshot_urls.length <= 1) return

    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % selectedPortfolio.screenshot_urls.length)
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + selectedPortfolio.screenshot_urls.length) % selectedPortfolio.screenshot_urls.length)
    }
  }

  const handleShare = async (portfolio: Portfolio) => {
    const shareText = `Check out this amazing portfolio: "${portfolio.title}"`
    const shareUrl = portfolio.website_url

    try {
      if (navigator.share) {
        await navigator.share({
          title: portfolio.title,
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

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  // Edit Portfolio Functions
  const openEditModal = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio)
    setEditForm({
      title: portfolio.title,
      description: portfolio.description,
      website_url: portfolio.website_url,
      is_public: portfolio.is_public
    })
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingPortfolio(null)
    setEditForm({
      title: '',
      description: '',
      website_url: '',
      is_public: false
    })
  }

  const handleUpdatePortfolio = async () => {
    if (!editingPortfolio || !user) return

    try {
      setIsEditing(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/portfolio/upload`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          id: editingPortfolio.id,
          ...editForm
        })
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: "Portfolio Updated",
          description: "Your portfolio has been successfully updated.",
        })
        fetchPortfolios() // Refresh the list
        closeEditModal()
      } else {
        throw new Error(result.error || 'Failed to update portfolio')
      }
    } catch (error) {
      console.error('Error updating portfolio:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/portfolio/upload`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ id: portfolioId })
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: "Portfolio Deleted",
          description: "Your portfolio has been successfully deleted.",
        })
        fetchPortfolios() // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to delete portfolio')
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete portfolio. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReplaceScreenshots = async (portfolioId: string, files: FileList) => {
    if (!user || files.length === 0) return

    try {
      setUploadingScreenshots(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      const formData = new FormData()
      formData.append('portfolioId', portfolioId)
      formData.append('action', 'replace_screenshots')
      
      Array.from(files).forEach((file, index) => {
        formData.append(`screenshots`, file)
      })

      const response = await fetch('/api/portfolio/upload', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: "Screenshots Updated",
          description: "Your screenshots have been successfully replaced.",
        })
        fetchPortfolios() // Refresh the list
        if (selectedPortfolio?.id === portfolioId) {
          closeModal() // Close modal to see updates
        }
      } else {
        throw new Error(result.error || 'Failed to update screenshots')
      }
    } catch (error) {
      console.error('Error updating screenshots:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update screenshots. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingScreenshots(false)
    }
  }

  const isOwner = (portfolio: Portfolio) => {
    return user && portfolio.user_id === user.id
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPortfolios.map((portfolio) => (
        <Card key={portfolio.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => openModal(portfolio)}>
            {portfolio.screenshot_urls.length > 0 ? (
              <img
                src={portfolio.screenshot_urls[0]}
                alt={portfolio.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const placeholder = document.createElement('div')
                  placeholder.className = 'w-full h-full bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center'
                  placeholder.innerHTML = `
                    <div class="text-center text-gray-600">
                      <svg class="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                      <p class="text-sm font-medium">Portfolio Preview</p>
                    </div>
                  `
                  target.parentElement?.appendChild(placeholder)
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <Camera className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm font-medium">No Preview Available</p>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Hover Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(portfolio.website_url, '_blank')
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare(portfolio)
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Personal Mode Management Buttons */}
            {mode === 'personal' && isOwner(portfolio) && (
              <div className="absolute top-4 left-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-green-500/20 backdrop-blur-sm border-white/30 text-white hover:bg-green-500/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditModal(portfolio)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-red-500/20 backdrop-blur-sm border-white/30 text-white hover:bg-red-500/30"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{portfolio.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Screenshot Count Badge */}
            {portfolio.screenshot_count > 1 && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 text-xs">
                  {portfolio.screenshot_count} images
                </Badge>
              </div>
            )}

            {/* Privacy Badge */}
            {mode === 'personal' && isOwner(portfolio) && (
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Badge variant="outline" className={`text-white border-white/30 text-xs ${
                  portfolio.is_public ? 'bg-green-500/20' : 'bg-gray-500/20'
                }`}>
                  {portfolio.is_public ? 'Public' : 'Private'}
                </Badge>
              </div>
            )}

            {/* Prompt Link Badge */}
            {portfolio.prompt_id && (
              <div className={`absolute ${mode === 'personal' && isOwner(portfolio) ? 'bottom-12' : 'bottom-4'} left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <Badge variant="outline" className="text-white border-white/30 bg-blue-500/20 text-xs">
                  Linked to Prompt
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Title and Date */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg line-clamp-1">{portfolio.title}</h3>
                  <p className="text-gray-500 text-sm">{formatDate(portfolio.created_at)}</p>
                </div>
              </div>

              {/* Description */}
              {portfolio.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {portfolio.description}
                </p>
              )}

              {/* URL */}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer truncate" 
                      onClick={() => window.open(portfolio.website_url, '_blank')}>
                  {portfolio.website_url.replace(/^https?:\/\//, '')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openModal(portfolio)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
                
                <div className="flex items-center gap-2">
                  {/* Personal Mode Management */}
                  {mode === 'personal' && isOwner(portfolio) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(portfolio)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(portfolio.website_url, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShare(portfolio)}
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

  return (
    <>
      {/* Main Header - Only show if not embedded in tabs */}
      {!title.includes("Community") && !title.includes("My Portfolio") && (
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              {title}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>
      )}

      {/* Tab-specific header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>

      {showPublicOnly || user ? (
        <>
          {/* Filters and Controls */}
          <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search portfolios..."
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
                    <SelectItem value="all">All Portfolios</SelectItem>
                    <SelectItem value="with_prompts">Linked to Prompts</SelectItem>
                    <SelectItem value="without_prompts">Standalone</SelectItem>
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
                  onClick={fetchPortfolios}
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
                </div>
              </div>
            </div>

            {/* Stats */}
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>
                {isLoading ? 'Loading...' : `${filteredPortfolios.length} of ${portfolios.length} portfolios`}
              </span>
              <span>{mode === 'community' ? 'Community showcase' : 'Your portfolio collection'}</span>
            </div>
          </div>

          {/* Portfolios Display */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading portfolios...</p>
              </div>
            </div>
          ) : filteredPortfolios.length === 0 ? (
            <div className="text-center py-20">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                {portfolios.length === 0 ? 'No portfolios yet' : 'No portfolios found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {portfolios.length === 0 ? 
                  (mode === 'community' ? 'Be the first to share your portfolio with the community!' : 'Create your first portfolio to get started') : 
                  'Try adjusting your search or filters'}
              </p>
              {portfolios.length === 0 && mode === 'personal' && (
                <Button asChild>
                  <a href="/prompt-generator">Create Your First Portfolio</a>
                </Button>
              )}
              {portfolios.length > 0 && (
                <Button onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <GridView />
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">Sign in to view portfolios</h3>
          <p className="text-gray-500 mb-6">Create an account to upload and manage your portfolio showcase</p>
        </div>
      )}

      {/* View Portfolio Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPortfolio && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedPortfolio.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Image Gallery */}
                {selectedPortfolio.screenshot_urls.length > 0 && (
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedPortfolio.screenshot_urls[currentImageIndex]}
                        alt={`${selectedPortfolio.title} - Screenshot ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image Navigation */}
                    {selectedPortfolio.screenshot_urls.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                          onClick={() => navigateImage('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm"
                          onClick={() => navigateImage('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                          {currentImageIndex + 1} / {selectedPortfolio.screenshot_urls.length}
                        </div>
                      </>
                    )}

                    {/* Replace Screenshots Button for Personal Mode */}
                    {mode === 'personal' && isOwner(selectedPortfolio) && (
                      <div className="absolute top-4 right-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          id="replace-screenshots"
                          onChange={(e) => {
                            if (e.target.files) {
                              handleReplaceScreenshots(selectedPortfolio.id, e.target.files)
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/80 backdrop-blur-sm"
                          onClick={() => document.getElementById('replace-screenshots')?.click()}
                          disabled={uploadingScreenshots}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingScreenshots ? 'Uploading...' : 'Replace Screenshots'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Portfolio Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedPortfolio.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-2">Website</h4>
                    <a 
                      href={selectedPortfolio.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline flex items-center gap-2"
                    >
                      {selectedPortfolio.website_url}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Created: {formatDate(selectedPortfolio.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(selectedPortfolio)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedPortfolio.website_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Portfolio Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigateModal('prev')}
                    disabled={filteredPortfolios.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous Portfolio
                  </Button>
                  <span className="text-sm text-gray-500">
                    {filteredPortfolios.findIndex(p => p.id === selectedPortfolio.id) + 1} of {filteredPortfolios.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => navigateModal('next')}
                    disabled={filteredPortfolios.length <= 1}
                  >
                    Next Portfolio
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Portfolio Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Portfolio title"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe your portfolio..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-url">Website URL</Label>
              <Input
                id="edit-url"
                value={editForm.website_url}
                onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                placeholder="https://your-portfolio.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-public"
                checked={editForm.is_public}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_public: checked })}
              />
              <Label htmlFor="edit-public">Make portfolio public</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePortfolio} disabled={isEditing}>
              {isEditing ? 'Updating...' : 'Update Portfolio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
