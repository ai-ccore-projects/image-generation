import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AICCORE Image Studio - AI-Powered Image Generation",
  description: "Transform and generate images using multiple AI models in our advanced studio environment",
  generator: 'VIjay'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <main className="container mx-auto px-4 pt-24 pb-20 flex-1">{children}</main>
              
              {/* Fixed Footer */}
              <footer className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-3 px-4 z-40">
                <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <div className="mb-1 sm:mb-0">
                    © 2025{" "}
                    <a 
                      href="https://www.aiccore-uno.ai/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                    >
                      AI-CCORE
                    </a>
                    . All rights reserved
                  </div>
                  <div className="flex items-center gap-1">
                    <span>built by</span>
                    <a 
                      href="https://www.linkedin.com/in/vijayaragupathy/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                    >
                      vijayaragupathy
                    </a>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
