/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enable ESLint checking during builds
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking during builds
    ignoreBuildErrors: false,
  },
  images: {
    domains: [
      'localhost',
      'replicate.delivery',
      'pbxt.replicate.delivery',
      'tjzk.replicate.delivery',
      'fal.media',
      'cdn.openai.com',
      'oaidalleapiprodscus.blob.core.windows.net'
    ],
  },
  // Compiler options for better browser support
  compiler: {
    // Remove console logs in production for better performance
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Add polyfills for older browsers
  webpack: (config, { dev, isServer }) => {
    // Add polyfills for older browsers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
}

export default nextConfig
