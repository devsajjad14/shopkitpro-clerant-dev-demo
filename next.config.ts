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
  
  // Essential experimental features only
  experimental: {
    // Required for 'use cache' directive
    useCache: true,
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

  // Generate stable build ID - removed to prevent chunk loading issues
  // generateBuildId: async () => {
  //   return 'build-' + Date.now()
  // },

  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/**/*', './types/**/*', './utils/**/*'],
    '/api/data-manager/**/*': ['./lib/data.ts', './lib/utils.ts'],
  },
  
  // Minimal webpack config - only essential optimizations to avoid chunk loading issues
  webpack: (config, { isServer }) => {
    // Only server-side optimizations (these work fine)
    if (isServer) {
      // Exclude unnecessary packages from server bundle  
      config.externals = [...(config.externals || []), {
        'canvas': 'canvas',
        'sharp': 'sharp',
      }]
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
