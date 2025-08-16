export type UploadPlatform = 'server' | 'vercel'

// Helper function to determine platform from URL (client-side only)
export function getPlatformFromUrl(url: string): UploadPlatform {
  if (url.includes('blob.vercel-storage.com') || url.startsWith('https://')) {
    return 'vercel'
  }
  return 'server'
}

// Check if migration is needed
export function needsMigration(url: string, currentPlatform: UploadPlatform): boolean {
  if (!url) return false
  return getPlatformFromUrl(url) !== currentPlatform
}

// Format platform display name
export function getPlatformDisplayName(platform: UploadPlatform): string {
  return platform === 'vercel' ? 'Vercel Platform' : 'Resource Platform'
}

// Get platform storage description
export function getPlatformDescription(platform: UploadPlatform): string {
  return platform === 'vercel' 
    ? 'Global CDN with automatic scaling'
    : 'Local server storage with full control'
}