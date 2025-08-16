'use client'

/**
 * Enterprise-grade deployment environment detection utility
 * Provides intelligent platform restrictions and capabilities detection
 */

export interface DeploymentEnvironment {
  platform: 'vercel' | 'server' | 'unknown'
  capabilities: {
    canUseServerStorage: boolean
    canUseVercelStorage: boolean
  }
  metadata: {
    isProduction: boolean
    deploymentId?: string
    region?: string
    url?: string
  }
}

/**
 * Comprehensive deployment environment detection
 * Uses multiple detection methods for maximum reliability
 */
export function detectDeploymentEnvironment(): DeploymentEnvironment {
  // Server-side detection (when available)
  const isVercelServer = typeof process !== 'undefined' && (
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV !== undefined ||
    process.env.VERCEL_URL !== undefined ||
    process.env.VERCEL_REGION !== undefined
  )

  // Client-side detection methods
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const isVercelDomain = hostname.includes('vercel.app') || 
                        hostname.includes('vercel.dev') ||
                        hostname.includes('.now.sh')

  // Advanced URL pattern detection for custom Vercel domains
  const isVercelDeployment = typeof window !== 'undefined' && (
    window.location.hostname.match(/^[a-z0-9-]+-[a-z0-9-]+-[a-z0-9]+\.vercel\.app$/) ||
    isVercelDomain
  )

  // Determine platform
  let platform: 'vercel' | 'server' | 'unknown' = 'unknown'
  
  if (isVercelServer || isVercelDeployment) {
    platform = 'vercel'
  } else if (typeof window !== 'undefined' && (
    hostname === 'localhost' || 
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.includes('local') ||
    !hostname.includes('.')
  )) {
    platform = 'server'
  } else {
    // For custom domains, assume server unless proven otherwise
    platform = 'server'
  }

  // Determine capabilities based on platform
  const capabilities = {
    canUseServerStorage: platform === 'server',
    canUseVercelStorage: true // Vercel storage available everywhere with proper tokens
  }

  // Gather metadata
  const metadata = {
    isProduction: typeof process !== 'undefined' 
      ? process.env.NODE_ENV === 'production'
      : !hostname.includes('localhost'),
    deploymentId: typeof process !== 'undefined' ? process.env.VERCEL_GIT_COMMIT_SHA : undefined,
    region: typeof process !== 'undefined' ? process.env.VERCEL_REGION : undefined,
    url: typeof window !== 'undefined' ? window.location.origin : undefined
  }

  return {
    platform,
    capabilities,
    metadata
  }
}

/**
 * Get user-friendly platform display information
 */
export function getPlatformDisplayInfo(env: DeploymentEnvironment) {
  const { platform, capabilities, metadata } = env

  const displayInfo = {
    name: platform === 'vercel' ? 'Vercel Cloud' : platform === 'server' ? 'Local Server' : 'Unknown',
    icon: platform === 'vercel' ? '☁️' : platform === 'server' ? '🖥️' : '❓',
    color: platform === 'vercel' ? 'blue' : platform === 'server' ? 'green' : 'gray',
    description: platform === 'vercel' 
      ? 'Cloud deployment with edge optimization'
      : platform === 'server' 
      ? 'Local server with full file system access'
      : 'Unknown deployment environment'
  }

  return {
    ...displayInfo,
    capabilities,
    restrictions: {
      serverStorage: !capabilities.canUseServerStorage ? {
        reason: 'Server file system not available in cloud deployment',
        suggestion: 'Use Vercel Blob storage for cloud-compatible assets'
      } : null,
      vercelStorage: !capabilities.canUseVercelStorage ? {
        reason: 'Vercel Blob storage requires configuration',
        suggestion: 'Configure BLOB_READ_WRITE_TOKEN environment variable'
      } : null
    }
  }
}

/**
 * React hook for deployment environment detection with caching
 */
export function useDeploymentEnvironment() {
  const [env, setEnv] = React.useState<DeploymentEnvironment | null>(null)

  React.useEffect(() => {
    // Cache the detection result to avoid repeated checks
    const cacheKey = 'deployment-environment-cache'
    const cached = sessionStorage.getItem(cacheKey)
    
    if (cached) {
      try {
        setEnv(JSON.parse(cached))
        return
      } catch {
        // Invalid cache, proceed with fresh detection
      }
    }

    const detected = detectDeploymentEnvironment()
    setEnv(detected)
    
    // Cache for session
    sessionStorage.setItem(cacheKey, JSON.stringify(detected))
  }, [])

  return env
}

// Import React for the hook
import React from 'react'