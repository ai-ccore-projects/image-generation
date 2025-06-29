"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeSafeLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only render after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show light logo by default during SSR and hydration
  if (!mounted) {
    return (
      <img 
        src="/image.png" 
        alt="AICCORE" 
        className="h-16 w-auto"
      />
    )
  }

  // Show theme-appropriate logo after hydration
  return (
    <img 
      src={resolvedTheme === 'dark' ? '/logo.png' : '/image.png'} 
      alt="AICCORE" 
      className="h-16 w-auto"
    />
  )
} 