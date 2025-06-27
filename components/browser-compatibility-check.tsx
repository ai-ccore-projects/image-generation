'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface BrowserFeature {
  name: string
  supported: boolean
  critical: boolean
}

export function BrowserCompatibilityCheck() {
  const [features, setFeatures] = useState<BrowserFeature[]>([])
  const [browserInfo, setBrowserInfo] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Detect browser
    const userAgent = navigator.userAgent
    setBrowserInfo(userAgent)

    // Check browser features
    const featureChecks: BrowserFeature[] = [
      {
        name: 'backdrop-filter (blur effects)',
        supported: CSS.supports('backdrop-filter', 'blur(8px)'),
        critical: false
      },
      {
        name: 'background-clip: text (gradient text)',
        supported: CSS.supports('-webkit-background-clip', 'text') || CSS.supports('background-clip', 'text'),
        critical: false
      },
      {
        name: 'aspect-ratio',
        supported: CSS.supports('aspect-ratio', '1 / 1'),
        critical: false
      },
      {
        name: 'CSS Grid',
        supported: CSS.supports('display', 'grid'),
        critical: true
      },
      {
        name: 'Flexbox',
        supported: CSS.supports('display', 'flex'),
        critical: true
      },
      {
        name: 'ES6 Modules',
        supported: 'noModule' in HTMLScriptElement.prototype,
        critical: true
      },
      {
        name: 'fetch API',
        supported: 'fetch' in window,
        critical: true
      },
      {
        name: 'Intersection Observer',
        supported: 'IntersectionObserver' in window,
        critical: false
      },
      {
        name: 'CSS Custom Properties',
        supported: CSS.supports('--test', 'value'),
        critical: true
      },
      {
        name: 'viewport units (vh/vw)',
        supported: CSS.supports('height', '100vh'),
        critical: true
      },
      {
        name: 'small viewport units (svh)',
        supported: CSS.supports('height', '100svh'),
        critical: false
      }
    ]

    setFeatures(featureChecks)
  }, [])

  const criticalIssues = features.filter(f => !f.supported && f.critical).length
  const nonCriticalIssues = features.filter(f => !f.supported && !f.critical).length

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {criticalIssues > 0 ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : nonCriticalIssues > 0 ? (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            Browser Compatibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            <strong>Browser:</strong> {browserInfo.split(' ')[0]}
          </div>
          
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className={feature.critical ? 'font-medium' : ''}>{feature.name}</span>
              <Badge 
                variant={feature.supported ? 'default' : feature.critical ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {feature.supported ? '✓' : '✗'}
              </Badge>
            </div>
          ))}

          {criticalIssues > 0 && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
              <strong>Critical issues detected!</strong> Your browser may not fully support this app.
            </div>
          )}

          {nonCriticalIssues > 0 && criticalIssues === 0 && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
              Some visual features may not work as expected.
            </div>
          )}

          {criticalIssues === 0 && nonCriticalIssues === 0 && (
            <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
              Your browser fully supports this app!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 