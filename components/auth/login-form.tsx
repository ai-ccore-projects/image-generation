"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { signIn, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && mounted) {
      console.log('User signed in successfully, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [user, mounted, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mounted) return
    
    setLoading(true)
    setError("")

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    console.log('Attempting to sign in with email:', email)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        console.error('Sign in error:', error)
        
        // Handle specific error types
        if (error.message?.includes('Invalid login credentials')) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (error.message?.includes('Email not confirmed')) {
          setError("Please check your email and click the confirmation link before signing in.")
        } else if (error.message?.includes('Too many requests')) {
          setError("Too many sign-in attempts. Please wait a few minutes and try again.")
        } else if (error.message?.includes('Network error')) {
          setError("Network connection error. Please check your internet connection.")
        } else {
          setError(error.message || "An unexpected error occurred. Please try again.")
        }
      } else {
        console.log('Sign in successful!')
        // Success will be handled by useEffect when user state changes
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err)
      setError("An unexpected error occurred. Please try again.")
    }

    setLoading(false)
  }

  if (!mounted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>Enter your email and password to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button type="submit" className="w-full" disabled={loading || !email || !password}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        
        {/* Test Account Info for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Test Accounts:</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              Try: hennaj09@gmail.com or mmalraja@unomaha.edu
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
