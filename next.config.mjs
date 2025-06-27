/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
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
  experimental: {
    legacyBrowsers: false,
    browsersListForSwc: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
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
