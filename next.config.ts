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
value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob: *.vercel-storage.com; font-src 'self' data:; connect-src 'self' *.vercel-storage.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
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
          // Temporarily disabled - may cause chunk loading issues
          // {
          //   key: 'Cache-Control',
          //   value: 'public, max-age=31536000, immutable',
          // },
        ],
      },
    ]
  },
  
  // Essential experimental features only
  experimental: {
    // Required for 'use cache' directive
    useCache: true,
  },
  
  // Turbopack configuration - removed to fix chunk loading issues
  // turbopack: {
  //   rules: {
  //     '*.svg': {
  //       loaders: ['@svgr/webpack'],
  //       as: '*.js',
  //     },
  //   },
  // },
  
  // Simplified image optimization
  images: {
    formats: ['image/webp'],
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

  // Generate stable build ID for consistent chunk naming
  generateBuildId: async () => {
    // Use a stable ID for better chunk caching
    return process.env.VERCEL_GIT_COMMIT_SHA || 'local-build'
  },

  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/**/*', './types/**/*', './utils/**/*'],
    '/api/data-manager/**/*': ['./lib/data.ts', './lib/utils.ts'],
  },
  
  // Webpack config - Keep 250MB optimization but fix chunk loading
  webpack: (config, { isServer, dev }) => {
    // Server-side optimizations (for 250MB limit)
    if (isServer) {
      config.externals = [...(config.externals || []), {
        'canvas': 'canvas',
        'sharp': 'sharp',
      }]
    }

    // Optimize chunks for Vercel compatibility - client-side only
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // Keep your 240KB chunk limit
        cacheGroups: {
          // Simple, reliable chunk strategy for client only
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 20,
          },
          common: {
            minChunks: 2,
            chunks: 'all', 
            name: 'common',
            priority: 10,
          },
        },
      }
      
      // Ensure stable chunk names for Vercel
      config.optimization.moduleIds = 'deterministic'
      config.optimization.chunkIds = 'deterministic'
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
  
  // Performance budgets - removed to prevent chunk loading issues
  // onDemandEntries: {
  //   maxInactiveAge: 25 * 1000,
  //   pagesBufferLength: 2,
  // },
}

export default nextConfig
