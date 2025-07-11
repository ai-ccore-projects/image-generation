"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, LogOut, Save, Loader2, UserPlus } from "lucide-react"
import { AuthForm } from "./login-form"

interface UserProfile {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url?: string
  created_at: string
}

interface UserProfileModalProps {
  children: React.ReactNode
}

interface SignupModalProps {
  children: React.ReactNode
}

export function UserProfileModal({ children }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()

  // Form states
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (user && open) {
      fetchProfile()
    }
  }, [user, open])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to load profile')
      } else {
        setProfile(data)
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user || !profile) return

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        setError('Failed to save profile')
      } else {
        setSuccess('Profile updated successfully!')
        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          display_name: displayName.trim(),
          bio: bio.trim()
        } : null)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    setOpen(false)
    signOut()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View and edit your profile information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info Section */}
            <div className="text-center space-y-3">
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarFallback className="text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              
              {profile?.username && (
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">@{profile.username}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Edit Profile Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={saveProfile} 
                  disabled={saving}
                  className="flex-1"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>

            <Separator />

            {/* Sign Out Section */}
            <div className="space-y-2">
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {profile?.created_at && (
              <div className="text-center text-xs text-gray-500">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function SignupModal({ children }: SignupModalProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join NextGen AI Studio
          </DialogTitle>
          <DialogDescription>
            Create your account to start generating amazing AI content
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <AuthForm defaultTab="signup" onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 