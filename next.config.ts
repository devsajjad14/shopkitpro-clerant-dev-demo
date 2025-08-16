import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: '/api/media/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
  experimental: {
    useCache: true,

    cacheLife: {
      biweekly: {
        stale: 60 * 60 * 24 * 14, // 14 days
        revalidate: 60 * 60 * 24 * 7, // 7 day
        expire: 60 * 60 * 24 * 14, // 14 days
      },
    },
  },
  images: {
    minimumCacheTTL: 86400, // 1 day in seconds
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/avif', 'image/webp'],

    unoptimized: false, // Set to true for unoptimized images
    loader: 'default', // Use default Next.js image loader

    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },

  // ✅ Ignore ESLint and TypeScript errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
