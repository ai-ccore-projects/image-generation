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
    domains: ['images.unsplash.com', 'ykmonkeyckzpcbxihpvz.supabase.co'],
  },
}

export default nextConfig
