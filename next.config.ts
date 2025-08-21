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

  // Advanced output file tracing for function size optimization
  outputFileTracingExcludes: {
    '*': [
      // Build caches and artifacts
      '.next/cache/**',
      '.next/trace',
      '.next/app-build-manifest.json',
      '.next/static/chunks/**/*.map',
      
      // Git files
      '.git/**',
      '.git/objects/**',
      
      // Node modules optimization
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      'node_modules/@next/swc-linux-x64-gnu',
      'node_modules/@next/swc-linux-x64-musl',
      'node_modules/sharp/vendor/**',
      'node_modules/canvas/**',
      'node_modules/puppeteer/**',
      'node_modules/playwright/**',
      'node_modules/.cache/**',
      'node_modules/**/*.md',
      'node_modules/**/*.txt',
      'node_modules/**/test/**',
      'node_modules/**/tests/**',
      'node_modules/**/__tests__/**',
      'node_modules/**/docs/**',
      'node_modules/**/example/**',
      'node_modules/**/examples/**',
      'node_modules/**/coverage/**',
      'node_modules/**/.nyc_output/**',
      'node_modules/**/bench/**',
      'node_modules/**/benchmark/**',
      
      // Project files
      'demo-data/**',
      'data-db/**',
      'demo-media/**',
      'public/uploads/**',
      'public/images/**',
      'scripts/**',
      'drizzle/**',
      'prisma/**',
    ],
  },

  // Ensure CSS processing works correctly in production
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },

  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/**/*', './types/**/*', './utils/**/*'],
    '/api/data-manager/**/*': ['./lib/data.ts', './lib/utils.ts'],
  },
  
  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize chunks for client-side only
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // ~240KB chunks
        cacheGroups: {
          default: false,
          vendors: false,
          // React chunk
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          // UI libraries chunk
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@heroicons|lucide-react)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          // Charts and visualization
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|recharts|react-chartjs-2)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
            enforce: true,
          },
          // Common chunk
          common: {
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 10,
          },
        },
      }
    }
    
    // Server-side bundle size optimization
    if (isServer) {
      // Exclude unnecessary packages from server bundle
      config.externals = [...(config.externals || []), {
        'canvas': 'canvas',
        'sharp': 'sharp',
        '@next/font': '@next/font',
      }]
      
      // Minimize server bundle
      config.optimization.minimize = true
    }
    
    // Exclude large files from bundle
    config.module.rules.push({
      test: /\.(jpg|jpeg|png|gif|webp|avif)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    })
    
    // Add bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    
    return config
  },
  
  // Output optimization (standalone disabled for Vercel)
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Compile only what's needed
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable static optimization
  poweredByHeader: false,
  reactStrictMode: true,

  // Force CSS to be processed correctly
  
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
