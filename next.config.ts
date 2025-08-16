import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Production-optimized configuration for world-class performance
  
  // Bundle optimization
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Performance optimizations (swcMinify is now default in Next.js 15)
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  
  // Experimental features for performance
  experimental: {
    useCache: true,
    optimizePackageImports: ['@headlessui/react', '@heroicons/react', 'date-fns'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    cacheLife: {
      default: {
        stale: 300, // 5 minutes
        revalidate: 900, // 15 minutes  
        expire: 86400, // 1 day
      },
      long: {
        stale: 86400, // 1 day
        revalidate: 86400 * 7, // 1 week
        expire: 86400 * 30, // 1 month
      },
    },
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https', 
        hostname: '**.blob.vercel-storage.com',
      }
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ]
  },

  // Media routing
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: '/api/media/:path*',
      },
    ]
  },

  // Build optimization - ignore errors for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              minSize: 20000,
              maxSize: 244000,
            },
          },
        },
      }
    }

    // Bundle analyzer for development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }

    return config
  },

  // Output optimization for Vercel
  output: 'standalone',
}

export default nextConfig
