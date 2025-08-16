/**
 * Server-side deployment environment detection utility
 * Compatible with Next.js API routes and server components
 */

export interface ServerDeploymentEnvironment {
  platform: 'vercel' | 'server' | 'unknown'
  capabilities: {
    canUseServerStorage: boolean
    canUseVercelStorage: boolean
  }
  metadata: {
    isProduction: boolean
    deploymentId?: string
    region?: string
    nodeEnv?: string
  }
}

/**
 * Server-side deployment environment detection
 * Uses only server-available environment variables and APIs
 */
export function detectServerDeploymentEnvironment(): ServerDeploymentEnvironment {
  // Server-side detection using environment variables
  const isVercelServer = (
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV !== undefined ||
    process.env.VERCEL_URL !== undefined ||
    process.env.VERCEL_REGION !== undefined ||
    process.env.VERCEL_GIT_COMMIT_SHA !== undefined
  )

  // Additional Vercel indicators
  const hasVercelEnvVars = !!(
    process.env.VERCEL_URL ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_REGION
  )

  // Determine platform
  let platform: 'vercel' | 'server' | 'unknown' = 'unknown'
  
  if (isVercelServer || hasVercelEnvVars) {
    platform = 'vercel'
  } else {
    // Default to server for local development and custom deployments
    platform = 'server'
  }

  // Determine capabilities based on platform
  const capabilities = {
    canUseServerStorage: platform === 'server',
    canUseVercelStorage: true // Vercel storage available everywhere with proper tokens
  }

  // Gather server-side metadata
  const metadata = {
    isProduction: process.env.NODE_ENV === 'production',
    deploymentId: process.env.VERCEL_GIT_COMMIT_SHA,
    region: process.env.VERCEL_REGION,
    nodeEnv: process.env.NODE_ENV
  }

  return {
    platform,
    capabilities,
    metadata
  }
}

/**
 * Get user-friendly platform display information for server context
 */
export function getServerPlatformDisplayInfo(env: ServerDeploymentEnvironment) {
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
 * Check if the current environment supports server storage operations
 */
export function canUseServerStorage(): boolean {
  const env = detectServerDeploymentEnvironment()
  return env.capabilities.canUseServerStorage
}

/**
 * Check if the current environment supports Vercel Blob storage
 */
export function canUseVercelStorage(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN)
}

/**
 * Get the optimal storage platform for the current environment
 */
export function getOptimalStoragePlatform(): 'server' | 'vercel' {
  const env = detectServerDeploymentEnvironment()
  
  if (env.platform === 'vercel') {
    return 'vercel'
  }
  
  // For server environments, prefer server storage if available
  return env.capabilities.canUseServerStorage ? 'server' : 'vercel'
}