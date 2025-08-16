'use server'

import { put, del } from '@vercel/blob'
import sharp from 'sharp'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getSettings } from '@/lib/actions/settings'
import { detectServerDeploymentEnvironment } from '@/lib/utils/server-deployment-detection'

export type UploadPlatform = 'server' | 'vercel'
export type AssetType = 'logo' | 'favicon' | 'product' | 'product-alt' | 'product-variant' | 'brand' | 'user' | 'banner' | 'mini-banner' | 'page'

interface UploadResult {
  success: boolean
  url?: string
  urls?: { large?: string; medium?: string; small?: string }
  path?: string
  error?: string
}

// Get current platform from settings with smart fallback
async function getCurrentPlatform(): Promise<UploadPlatform> {
  try {
    const settings = await getSettings('general')
    return (settings.platform === 'vercel') ? 'vercel' : 'server'
  } catch (error) {
    console.warn('Failed to get platform setting, using environment detection:', error)
    
    // Fallback to environment detection
    const deploymentEnv = detectServerDeploymentEnvironment()
    return deploymentEnv.platform === 'vercel' ? 'vercel' : 'server'
  }
}

// Server-side local storage functions
async function uploadToServer(
  buffer: Buffer, 
  type: AssetType, 
  originalName: string,
  styleId?: string,
  isAlternate?: boolean,
  alternateIndex?: string,
  color?: string
): Promise<UploadResult> {
  try {
    // Create media directories if they don't exist
    const baseMediaDir = join(process.cwd(), 'media')
    let targetDir: string
    
    if (type.startsWith('product')) {
      targetDir = join(baseMediaDir, 'products')
    } else if (type === 'brand') {
      targetDir = join(baseMediaDir, 'brands')
    } else if (type === 'user') {
      targetDir = join(baseMediaDir, 'users')
    } else if (type === 'banner') {
      targetDir = join(baseMediaDir, 'main-banners')
    } else if (type === 'mini-banner') {
      targetDir = join(baseMediaDir, 'mini-banners')
    } else if (type === 'page') {
      targetDir = join(baseMediaDir, 'pages')
    } else {
      targetDir = join(baseMediaDir, 'site')
    }
    
    if (!existsSync(baseMediaDir)) {
      await mkdir(baseMediaDir, { recursive: true })
    }
    
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }
    
    // Generate filename based on type
    const timestamp = Date.now()
    // Sanitize filename: remove special characters, spaces, and non-ASCII characters
    const sanitizedName = originalName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars and spaces with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .toLowerCase() // Convert to lowercase for consistency
    const nameWithoutExt = sanitizedName || 'image' // Fallback if name becomes empty
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
    
    let filename: string
    let filePath: string
    
    if (type === 'product' && styleId) {
      // For main product images, create three sizes (match existing convention)
      const uniqueId = timestamp.toString().slice(-10) // Use last 10 digits as unique ID
      const largeFilename = `${styleId}_l_${uniqueId}.jpg`
      const mediumFilename = `${styleId}_m_${uniqueId}.jpg`
      const smallFilename = `${styleId}_s_${uniqueId}.jpg`
      
      const largeFilePath = join(targetDir, largeFilename)
      const mediumFilePath = join(targetDir, mediumFilename)
      const smallFilePath = join(targetDir, smallFilename)
      
      // Process and save three sizes
      const [largeBuffer, mediumBuffer, smallBuffer] = await Promise.all([
        sharp(buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer(),
        sharp(buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer(),
        sharp(buffer)
          .resize(180, 180, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer(),
      ])
      
      await Promise.all([
        writeFile(largeFilePath, largeBuffer),
        writeFile(mediumFilePath, mediumBuffer),
        writeFile(smallFilePath, smallBuffer),
      ])
      
      return {
        success: true,
        urls: {
          large: `/media/products/${largeFilename}`,
          medium: `/media/products/${mediumFilename}`,
          small: `/media/products/${smallFilename}`,
        },
        path: largeFilePath
      }
    } else if (type === 'product-alt' && styleId && alternateIndex) {
      // Match existing convention: {styleId}_alt_{index}_{uniqueId}.jpg
      const uniqueId = timestamp.toString().slice(-10)
      filename = `${styleId}_alt_${alternateIndex}_${uniqueId}.jpg`
      filePath = join(targetDir, filename)
      
      const processedBuffer = await sharp(buffer)
        .jpeg({ quality: 90 })
        .toBuffer()
      
      await writeFile(filePath, processedBuffer)
      
      return {
        success: true,
        url: `/media/products/${filename}`,
        path: filePath
      }
    } else if (type === 'product-variant' && styleId && color) {
      // Match existing convention: {styleId}_{color}.jpg
      filename = `${styleId}_${color}.jpg`
      filePath = join(targetDir, filename)
      
      const processedBuffer = await sharp(buffer)
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer()
      
      await writeFile(filePath, processedBuffer)
      
      return {
        success: true,
        url: `/media/products/${filename}`,
        path: filePath
      }
    } else {
      // Logic for logo/favicon/brand/user/banner/mini-banner
      filename = `${type}_${timestamp}_${nameWithoutExt}.${extension}`
      filePath = join(targetDir, filename)
      
      let processedBuffer: Buffer
      
      if (type === 'logo' || type === 'brand') {
        processedBuffer = await sharp(buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (type === 'user') {
        processedBuffer = await sharp(buffer)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (type === 'banner') {
        processedBuffer = await sharp(buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (type === 'mini-banner') {
        processedBuffer = await sharp(buffer)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (type === 'page') {
        processedBuffer = await sharp(buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else {
        processedBuffer = await sharp(buffer)
          .resize(32, 32, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer()
      }
      
      await writeFile(filePath, processedBuffer)
      
      let publicUrl: string
      if (type.startsWith('product')) {
        publicUrl = `/media/products/${filename}`
      } else if (type === 'brand') {
        publicUrl = `/media/brands/${filename}`
      } else if (type === 'user') {
        publicUrl = `/media/users/${filename}`
      } else if (type === 'banner') {
        publicUrl = `/media/main-banners/${filename}`
      } else if (type === 'mini-banner') {
        publicUrl = `/media/mini-banners/${filename}`
      } else if (type === 'page') {
        publicUrl = `/media/pages/${filename}`
      } else {
        publicUrl = `/media/site/${filename}`
      }
      
      return {
        success: true,
        url: publicUrl,
        path: filePath
      }
    }
  } catch (error) {
    console.error('Server upload error:', error)
    return {
      success: false,
      error: `Failed to upload ${type} to server storage`
    }
  }
}

async function deleteFromServer(url: string): Promise<boolean> {
  try {
    console.log(`[SERVER-CLEANUP] Attempting to delete from server storage: ${url}`)
    
    // Convert public URL to file path (handle query parameters)
    const urlPath = url.split('?')[0] // Remove query parameters like ?v=timestamp
    const filename = urlPath.split('/').pop()
    if (!filename) {
      console.error('[SERVER-CLEANUP] ❌ Could not extract filename from URL')
      return false
    }
    
    console.log(`[SERVER-CLEANUP] Extracted filename: ${filename} from URL: ${url}`)
    
    let filePath: string
    
    if (url.includes('/media/products/')) {
      filePath = join(process.cwd(), 'media', 'products', filename)
    } else if (url.includes('/media/brands/')) {
      filePath = join(process.cwd(), 'media', 'brands', filename)
    } else if (url.includes('/media/users/')) {
      filePath = join(process.cwd(), 'media', 'users', filename)
    } else if (url.includes('/media/main-banners/')) {
      filePath = join(process.cwd(), 'media', 'main-banners', filename)
    } else if (url.includes('/media/mini-banners/')) {
      filePath = join(process.cwd(), 'media', 'mini-banners', filename)
    } else if (url.includes('/media/pages/')) {
      filePath = join(process.cwd(), 'media', 'pages', filename)
    } else {
      filePath = join(process.cwd(), 'media', 'site', filename)
    }
    
    console.log(`[SERVER-CLEANUP] Checking file exists: ${filePath}`)
    
    if (existsSync(filePath)) {
      await unlink(filePath)
      console.log(`[SERVER-CLEANUP] ✅ Successfully deleted from server storage: ${filePath}`)
      return true
    } else {
      console.log(`[SERVER-CLEANUP] ⚠️  File not found on server (may have been already deleted): ${filePath}`)
      return true // Consider this a success since the file is gone
    }
  } catch (error) {
    console.error(`[SERVER-CLEANUP] ❌ Server delete error for ${url}:`, error)
    return false
  }
}

// Vercel blob storage functions - USE EXISTING WORKING LOGIC
async function uploadToVercel(
  buffer: Buffer, 
  type: AssetType, 
  originalName: string,
  styleId?: string,
  isAlternate?: boolean,
  alternateIndex?: string,
  color?: string
): Promise<UploadResult> {
  try {
    // Check if Vercel blob token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not configured')
    }

    // For product images, delegate to existing proven Vercel logic
    if (type.startsWith('product')) {
      // Import the existing working functions
      const { generateImagePaths, randomTenDigitString } = await import('@/lib/utils/image-utils')
      
      const uniqueId = randomTenDigitString()
      let imagePaths = generateImagePaths(styleId!, isAlternate || false, alternateIndex, uniqueId)
      let imageBuffers: Buffer[]
      let variantPath: string | undefined = undefined
      
      if (type === 'product-variant' && color) {
        // Use exact same logic as existing route
        variantPath = `products/${styleId}_${color}.jpg`
      }

      if (isAlternate) {
        // Only one image for alternate images (no resizing)
        imageBuffers = [await sharp(buffer).jpeg({ quality: 90 }).toBuffer()]
      } else if (type === 'product-variant') {
        // Single image for variant
        imageBuffers = [await sharp(buffer).jpeg({ quality: 90 }).toBuffer()]
      } else {
        // Three sizes for main images - EXACT same logic as existing route
        imageBuffers = await Promise.all([
          // Large image (original size, max 1200px)
          sharp(buffer)
            .resize(1200, 1200, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ quality: 90 })
            .toBuffer(),
          // Medium image (300px)
          sharp(buffer)
            .resize(300, 300, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ quality: 85 })
            .toBuffer(),
          // Small image (180px)
          sharp(buffer)
            .resize(180, 180, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({ quality: 80 })
            .toBuffer(),
        ])
      }

      // Upload using EXACT same logic as existing route
      let blobUrls: string[]

      if (isAlternate) {
        // Upload single image for alternate
        const mainPath = imagePaths.main
        if (!mainPath) {
          throw new Error('Invalid alternate image path')
        }
        const blob = await put(mainPath, imageBuffers[0], {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        blobUrls = [blob.url]
        
        return {
          success: true,
          url: blob.url,
          path: mainPath
        }
      } else if (type === 'product-variant' && variantPath) {
        // Upload single image for variant combination or color
        const blob = await put(variantPath, imageBuffers[0], {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        })
        
        return {
          success: true,
          url: blob.url,
          path: variantPath
        }
      } else {
        // Upload three images for main
        const {
          large: largePath,
          medium: mediumPath,
          small: smallPath,
        } = imagePaths
        if (!largePath || !mediumPath || !smallPath) {
          throw new Error('Invalid main image paths')
        }
        
        const [largeBlob, mediumBlob, smallBlob] = await Promise.all([
          put(largePath, imageBuffers[0], {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
          }),
          put(mediumPath, imageBuffers[1], {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
          }),
          put(smallPath, imageBuffers[2], {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
          }),
        ])
        
        return {
          success: true,
          urls: {
            large: largeBlob.url,
            medium: mediumBlob.url,
            small: smallBlob.url,
          },
          path: largePath
        }
      }
    } else {
      // Logic for logo/favicon/brand
      const timestamp = Date.now()
      // Sanitize filename: remove special characters, spaces, and non-ASCII characters
      const sanitizedName = originalName
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars and spaces with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
        .toLowerCase() // Convert to lowercase for consistency
      const nameWithoutExt = sanitizedName || 'image' // Fallback if name becomes empty
      const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
      
      let filePath: string
      if (type === 'brand') {
        filePath = `brands/${type}_${timestamp}_${nameWithoutExt}.${extension}`
      } else if (type === 'user') {
        filePath = `users/${type}_${timestamp}_${nameWithoutExt}.${extension}`
      } else if (type === 'banner') {
        filePath = `main-banners/${type}_${timestamp}_${nameWithoutExt}.${extension}`
      } else if (type === 'mini-banner') {
        filePath = `mini-banners/${type}_${timestamp}_${nameWithoutExt}.${extension}`
      } else if (type === 'page') {
        filePath = `pages/${type}_${timestamp}_${nameWithoutExt}.${extension}`
      } else {
        filePath = `site/${type}_${timestamp}_${nameWithoutExt}.${extension}`
      }
      
      let processedBuffer: Buffer
      
      if (type === 'logo' || type === 'brand') {
        processedBuffer = await sharp(buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (type === 'user') {
        processedBuffer = await sharp(buffer)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (type === 'banner') {
        processedBuffer = await sharp(buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (type === 'mini-banner') {
        processedBuffer = await sharp(buffer)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else if (type === 'page') {
        processedBuffer = await sharp(buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer()
      } else {
        processedBuffer = await sharp(buffer)
          .resize(32, 32, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer()
      }
      
      const blob = await put(filePath, processedBuffer, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      
      return {
        success: true,
        url: blob.url,
        path: filePath
      }
    }
  } catch (error) {
    console.error('Vercel upload error:', error)
    
    // Specific error handling for missing token
    if (error instanceof Error && error.message.includes('BLOB_READ_WRITE_TOKEN')) {
      return {
        success: false,
        error: 'Vercel Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.'
      }
    }
    
    return {
      success: false,
      error: `Failed to upload ${type} to Vercel storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function deleteFromVercel(url: string): Promise<boolean> {
  try {
    console.log(`[VERCEL-CLEANUP] Attempting to delete from Vercel blob storage: ${url}`)
    
    // Check if Vercel blob token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[VERCEL-CLEANUP] ❌ BLOB_READ_WRITE_TOKEN environment variable is not configured')
      return false
    }
    
    await del(url)
    console.log(`[VERCEL-CLEANUP] ✅ Successfully deleted from Vercel blob storage: ${url}`)
    return true
  } catch (error) {
    console.error(`[VERCEL-CLEANUP] ❌ Vercel delete error for ${url}:`, error)
    
    // Enhanced error handling for common Vercel blob issues
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.log(`[VERCEL-CLEANUP] File not found in Vercel storage (may have been already deleted): ${url}`)
        return true // Consider this a success since the file is gone
      }
      if (error.message.includes('unauthorized') || error.message.includes('401')) {
        console.error('[VERCEL-CLEANUP] ❌ Unauthorized - check BLOB_READ_WRITE_TOKEN')
      }
    }
    
    return false
  }
}

// Main platform-aware upload functions
export async function uploadAsset(
  file: File, 
  type: AssetType,
  forcePlatform?: UploadPlatform,
  options?: {
    styleId?: string;
    isAlternate?: boolean;
    alternateIndex?: string;
    color?: string;
  }
): Promise<UploadResult> {
  try {
    const platform = forcePlatform || await getCurrentPlatform()
    const buffer = Buffer.from(await file.arrayBuffer())
    
    console.log(`Uploading ${type} to ${platform} platform`, options)
    
    if (platform === 'vercel') {
      return await uploadToVercel(
        buffer, 
        type, 
        file.name, 
        options?.styleId, 
        options?.isAlternate, 
        options?.alternateIndex, 
        options?.color
      )
    } else {
      return await uploadToServer(
        buffer, 
        type, 
        file.name, 
        options?.styleId, 
        options?.isAlternate, 
        options?.alternateIndex, 
        options?.color
      )
    }
  } catch (error) {
    console.error('Platform upload error:', error)
    return {
      success: false,
      error: `Failed to upload ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export async function deleteAsset(
  url: string, 
  forcePlatform?: UploadPlatform
): Promise<boolean> {
  try {
    console.log(`[PLATFORM-DELETE] Starting delete operation for URL: ${url}`)
    
    // Smart platform detection based on URL if no platform is forced
    let platform = forcePlatform
    if (!platform) {
      if (url.includes('blob.vercel-storage.com') || url.startsWith('https://')) {
        platform = 'vercel'
        console.log(`[PLATFORM-DELETE] Auto-detected Vercel platform from URL`)
      } else {
        platform = await getCurrentPlatform()
        console.log(`[PLATFORM-DELETE] Using configured platform: ${platform}`)
      }
    } else {
      console.log(`[PLATFORM-DELETE] Using forced platform: ${platform}`)
    }
    
    console.log(`[PLATFORM-DELETE] Deleting asset from ${platform} platform: ${url}`)
    
    if (platform === 'vercel') {
      return await deleteFromVercel(url)
    } else {
      return await deleteFromServer(url)
    }
  } catch (error) {
    console.error('[PLATFORM-DELETE] ❌ Platform delete error:', error)
    return false
  }
}

// Server-side helper function to determine platform from URL
async function getPlatformFromUrlServer(url: string): Promise<UploadPlatform> {
  if (url.includes('blob.vercel-storage.com') || url.startsWith('https://')) {
    return 'vercel'
  }
  return 'server'
}

// Migration helper: Move assets between platforms
export async function migrateAsset(
  currentUrl: string,
  targetPlatform: UploadPlatform,
  type: AssetType
): Promise<UploadResult> {
  try {
    // Download the current asset
    const response = await fetch(currentUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch current asset')
    }
    
    const buffer = Buffer.from(await response.arrayBuffer())
    
    // Create a temporary file object for upload
    const filename = currentUrl.split('/').pop() || `${type}.jpg`
    const tempFile = new File([buffer], filename, { type: 'image/jpeg' })
    
    // Upload to target platform
    const result = await uploadAsset(tempFile, type, targetPlatform)
    
    if (result.success) {
      // Delete from original platform
      const originalPlatform = await getPlatformFromUrlServer(currentUrl)
      await deleteAsset(currentUrl, originalPlatform)
    }
    
    return result
  } catch (error) {
    console.error('Asset migration error:', error)
    return {
      success: false,
      error: `Failed to migrate ${type} asset`
    }
  }
}

// Export additional utility functions
export { getCurrentPlatform }