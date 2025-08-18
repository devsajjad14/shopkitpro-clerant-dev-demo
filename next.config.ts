import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Modern Next.js 15 optimizations
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob: *.vercel-storage.com; font-src 'self'; connect-src 'self' *.vercel-storage.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
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
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Next.js 15 experimental features
  experimental: {
    // React Compiler (requires canary, disabled for stable build)
    // reactCompiler: true,
    
    // Advanced caching
    useCache: true,
    cacheLife: {
      default: {
        stale: 300, // 5 minutes
        revalidate: 900, // 15 minutes  
        expire: 3600, // 1 hour
      },
      long: {
        stale: 3600, // 1 hour
        revalidate: 86400, // 1 day
        expire: 604800, // 1 week
      },
      biweekly: {
        stale: 60 * 60 * 24 * 14, // 14 days
        revalidate: 60 * 60 * 24 * 7, // 7 days
        expire: 60 * 60 * 24 * 14, // 14 days
      },
    },
    
    // Performance optimizations
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@heroicons/react',
      'lucide-react',
      'react-icons',
    ],
    
    // Turbopack rules moved to stable config
  },
  
  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Enhanced image optimization
  images: {
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
      {
        protocol: 'https', 
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  
  // Output configuration for smaller serverless functions
  output: 'standalone',
  
  // Bundle size optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')()
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      )
    }
    // Optimize chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 10,
          },
          // React chunk
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 40,
          },
          // UI libraries chunk
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@heroicons|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 30,
          },
        },
      }
    }
    
    // Exclude large files from bundle
    config.module.rules.push({
      test: /\.(jpg|jpeg|png|gif|webp|avif)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    })

    // Optimize for serverless functions
    if (isServer) {
      // Exclude heavy client-side dependencies from server bundle
      config.externals = config.externals || []
      config.externals.push({
        'framer-motion': 'commonjs framer-motion',
        'react-icons/fi': 'commonjs react-icons/fi',
      })

      // Optimize API route chunks
      config.optimization = config.optimization || {}
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate API routes
          api: {
            test: /[\\/]app[\\/]api[\\/]/,
            name: 'api-common',
            chunks: 'all',
            priority: 50,
            minChunks: 2,
          },
          // Database operations
          database: {
            test: /[\\/](lib[\\/]db|data-manager)[\\/]/,
            name: 'database',
            chunks: 'all',
            priority: 60,
          },
        },
      }
    }
    
    return config
  },
  
  // Output optimization (standalone disabled for Vercel)
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Compile only what's needed
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Keep linter and typescript off as requested
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance budgets
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig
