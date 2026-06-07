// Sub-path deploy support. When NEXT_PUBLIC_BASE_PATH is set (e.g. "/image-generation"),
// Next.js serves the whole app — pages, _next assets, next/link, next/image, next/font,
// next/navigation router — under that prefix, so the app is self-sufficient behind the
// `dev` reverse-proxy (routes.json mode "basepath"). Unset (local dev) → no basePath,
// behavior unchanged. Set it via the env at BUILD and at `next start` (deploy.sh +
// ecosystem.config.cjs do both) — basePath is baked into the build, so the two must match.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "") || undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(basePath ? { basePath } : {}),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
