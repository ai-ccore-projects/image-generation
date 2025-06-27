"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - forcing completion')
        setLoading(false)
      }
    }, 5000) // 5 second timeout
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      })
      .catch((error) => {
        console.error('Auth session error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
        clearTimeout(loadingTimeout)
        
        // Handle logout event - clear data but don't auto-redirect
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing cached data')
          setUser(null)
          // Clear any cached data safely
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('supabase.auth.token')
              sessionStorage.clear()
            } catch (error) {
              console.warn('Error clearing storage:', error)
            }
          }
          // Let components handle their own navigation
        }
      }
    })

    return () => {
      setMounted(false)
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out user...')
      
      // Clear local state immediately to prevent UI issues
      if (mounted) {
        setUser(null)
      }
      
      // Clear cached data before signing out
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('supabase.auth.token')
          sessionStorage.clear()
        } catch (error) {
          console.warn('Error clearing storage:', error)
        }
      }
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        return { error }
      }
      
      console.log('User signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('Logout error:', error)
      return { error }
    }
  }

  // Don't render children until mounted to prevent hydration issues
  if (!mounted) {
    return null
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
