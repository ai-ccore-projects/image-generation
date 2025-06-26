'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props}
      // Prevent hydration mismatch by ensuring theme is available immediately
      storageKey="aiccore-theme"
      suppressHydrationWarning
    >
      {children}
    </NextThemesProvider>
  )
}
