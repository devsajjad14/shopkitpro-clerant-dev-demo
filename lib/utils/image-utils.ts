/**
 * Utility functions for managing product images in Vercel Blob storage
 */

export interface ImagePaths {
  large?: string
  medium?: string
  small?: string
  main?: string
}

/**
 * Generate a random 10-digit string
 */
export function randomTenDigitString(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString()
}

/**
 * Generate image paths for product images with a random 10-digit number
 * @param styleId - Product style ID
 * @param isAlternate - Whether this is an alternate image
 * @param alternateIndex - Index for alternate images (1, 2, 3, etc.)
 * @param uniqueId - Optional unique 10-digit string (if not provided, will generate)
 * @returns Object with image paths
 */
export function generateImagePaths(styleId: string, isAlternate: boolean = false, alternateIndex?: string, uniqueId?: string): ImagePaths {
  const baseDir = 'products'
  const rand = uniqueId || randomTenDigitString()
  if (isAlternate && alternateIndex) {
    // Alternate images: products/style_id_alt_1_rand.jpg
    return {
      main: `${baseDir}/${styleId}_alt_${alternateIndex}_${rand}.jpg`
    }
  } else {
    // Main images: products/style_id_l_rand.jpg, etc.
    return {
      large: `${baseDir}/${styleId}_l_${rand}.jpg`,
      medium: `${baseDir}/${styleId}_m_${rand}.jpg`,
      small: `${baseDir}/${styleId}_s_${rand}.jpg`
    }
  }
}

/**
 * Add cache-busting query parameter to image URL to force browser to fetch latest version
 * @param imageUrl - Original image URL
 * @returns Image URL with cache-busting parameter
 */
export function addCacheBuster(imageUrl: string): string {
  if (!imageUrl) return imageUrl
  
  const separator = imageUrl.includes('?') ? '&' : '?'
  const timestamp = Date.now()
  return `${imageUrl}${separator}v=${timestamp}`
}

/**
 * Extract style ID from image URL
 * @param imageUrl - Full image URL from Vercel Blob
 * @returns Style ID or null if not found
 */
export function extractStyleIdFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filename = pathParts[pathParts.length - 1]
    
    if (filename.includes('_alt_')) {
      // Alternate image: products/12345_alt_1.jpg -> 12345
      return filename.split('_alt_')[0]
    } else if (filename.includes('_l.') || filename.includes('_m.') || filename.includes('_s.')) {
      // Main image: products/12345_l.jpg -> 12345
      return filename.split('_')[0]
    }
    
    return null
  } catch (error) {
    console.error('Error extracting style ID from URL:', error)
    return null
  }
}

/**
 * Check if image URL is from products directory
 * @param imageUrl - Full image URL
 * @returns Boolean indicating if image is from products directory
 */
export function isProductImage(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl)
    return url.pathname.includes('/products/')
  } catch (error) {
    return false
  }
}

/**
 * Get optimized image URL for display
 * @param imageUrl - Original image URL
 * @param size - Desired size ('small', 'medium', 'large')
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(imageUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!isProductImage(imageUrl)) {
    return imageUrl
  }

  try {
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filename = pathParts[pathParts.length - 1]
    
    // If it's already the right size, return as is
    if (filename.includes(`_${size.charAt(0)}.`)) {
      return imageUrl
    }
    
    // For alternate images, return as is (no size variants)
    if (filename.includes('_alt_')) {
      return imageUrl
    }
    
    // For main images, get the appropriate size
    const styleId = filename.split('_')[0]
    const extension = filename.split('.').pop()
    const sizeSuffix = size === 'large' ? 'l' : size === 'medium' ? 'm' : 's'
    
    const newFilename = `${styleId}_${sizeSuffix}.${extension}`
    pathParts[pathParts.length - 1] = newFilename
    
    return `${url.origin}${pathParts.join('/')}`
  } catch (error) {
    console.error('Error optimizing image URL:', error)
    return imageUrl
  }
}

 