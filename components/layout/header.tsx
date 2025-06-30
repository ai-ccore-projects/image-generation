"use client"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserProfileModal, SignupModal } from "@/components/auth/user-profile"
import { Moon, Sun, Zap, Globe, Menu, X, Sparkles, UserPlus, LogIn } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Header() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if we're on the landing page
  const isLandingPage = pathname === "/"

  // Determine which studio the user is in based on the current path
  const isImageStudio = pathname === '/dashboard' || pathname === '/challenges' || pathname === '/gallery'
  const isPortfolioStudio = pathname === '/prompt-generator' || pathname === '/portfolio-gallery'

  // Define navigation item type
  type NavigationItem = {
    href: string
    label: string
    color: string
  }

  // Navigation items for different studios
  const imageStudioNavs: NavigationItem[] = [
    { href: '/dashboard', label: 'Battle Arena', color: 'hover:text-purple-600' },
    { href: '/challenges', label: 'Challenges', color: 'hover:text-blue-600' },
    { href: '/gallery', label: 'Image Gallery', color: 'hover:text-green-600' }
  ]

  const portfolioStudioNavs: NavigationItem[] = [
    { href: '/prompt-generator', label: 'Portfolio Studio', color: 'hover:text-purple-600' },
    { href: '/portfolio-gallery', label: 'Portfolio Gallery', color: 'hover:text-blue-600' }
  ]

  // Default navigation for home page or other pages
  const defaultNavs: NavigationItem[] = [
    { href: '/prompt-generator', label: 'Portfolio Studio', color: 'hover:text-purple-600' },
    { href: '/portfolio-gallery', label: 'Portfolio Gallery', color: 'hover:text-blue-600' },
    ...(user ? [
      { href: '/dashboard', label: 'Image Studio', color: 'hover:text-blue-600' },
      { href: '/challenges', label: 'Challenges', color: 'hover:text-blue-600' },
      { href: '/gallery', label: 'Image Gallery', color: 'hover:text-blue-600' }
    ] : [])
  ]

  // Select navigation items based on current context
  let navigationItems: NavigationItem[] = []
  if (!isLandingPage) {
    if (isImageStudio && user) {
      navigationItems = imageStudioNavs
    } else if (isPortfolioStudio) {
      navigationItems = portfolioStudioNavs
    } else {
      navigationItems = defaultNavs
    }
  }

  // Studio indicator
  const getStudioIndicator = () => {
    if (isLandingPage) return null
    
    if (isImageStudio && user) {
      return (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
          <Zap className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Image Studio</span>
        </div>
      )
    } else if (isPortfolioStudio) {
      return (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
          <Globe className="h-3 w-3 text-purple-600" />
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Portfolio Studio</span>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              {/* Light mode logo */}
              <img 
                src="/image.png" 
                alt="AICCORE" 
                className="h-16 w-auto block dark:hidden"
              />
              {/* Dark mode logo */}
              <img 
                src="/logo.png" 
                alt="AICCORE" 
                className="h-14 w-auto hidden dark:block"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NextGen AI Studio
              </span>
            </Link>
            
            {/* Studio Indicator */}
            {getStudioIndicator()}
          </div>

          <div className="flex items-center space-x-6">
            {/* Studio Navigation for Landing Page */}
            {isLandingPage && (
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/dashboard">
                  <div className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Image Studio
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        AI-powered image generation
                      </p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/prompt-generator">
                  <div className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:scale-105">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Portfolio Studio
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        AI-enhanced prompts & gallery
                      </p>
                    </div>
                  </div>
                </Link>
              </nav>
            )}

            {/* Desktop Navigation - For other pages */}
            {!isLandingPage && (
              <nav className="hidden md:flex items-center space-x-6">
                {navigationItems.map((nav) => (
                  <Link 
                    key={nav.href} 
                    href={nav.href} 
                    className={`text-sm font-medium ${nav.color} transition-colors relative ${
                      pathname === nav.href ? 'text-purple-600 font-semibold' : ''
                    }`}
                  >
                    {nav.label}
                    {pathname === nav.href && (
                      <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                    )}
                  </Link>
                ))}
              </nav>
            )}

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>

              {user ? (
                <UserProfileModal>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </UserProfileModal>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth">
                    <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <SignupModal>
                    <Button size="sm" className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Join</span>
                    </Button>
                  </SignupModal>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b md:hidden">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Auth Buttons */}
            {!user && (
              <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                <SignupModal>
                  <Button size="sm" className="w-full flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Get Started
                  </Button>
                </SignupModal>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
            {/* Studio Navigation for Landing Page Mobile */}
            {isLandingPage && (
              <div className="space-y-3">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-700">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Image Studio
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        AI-powered image generation
                      </p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/prompt-generator" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-700">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Portfolio Studio
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        AI-enhanced prompts & gallery
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Studio Indicator for Mobile - Other pages */}
            {!isLandingPage && (
              <>
                {(isImageStudio && user) && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Image Studio</span>
                  </div>
                )}
                {isPortfolioStudio && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
                    <Globe className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Portfolio Studio</span>
                  </div>
                )}
                
                {/* Navigation Links */}
                {navigationItems.map((nav) => (
                  <Link 
                    key={nav.href} 
                    href={nav.href} 
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === nav.href 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 font-semibold' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {nav.label}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
