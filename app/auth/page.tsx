"use client"

import { useAuth } from "@/contexts/auth-context"
import { AuthForm } from "@/components/auth/login-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <AuthForm />
    </div>
  )
}
