'use server'

import { put, del, list } from '@vercel/blob'
import sharp from 'sharp'
import { writeFile, mkdir, unlink, access, constants } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getSettings } from '@/lib/actions/settings'
import { detectServerDeploymentEnvironment } from '@/lib/utils/server-deployment-detection'

// Expert helper functions
async function checkDirectoryWritable(dirPath: string): Promise<boolean> {
  try {
    await access(dirPath, constants.W_OK)
    return true
  } catch {
    return false
  }
}

function detectFileTypeFromBuffer(buffer: Buffer): string {
  const signature = buffer.slice(0, 12).toString('hex')
  
  // File signature detection
  if (signature.startsWith('52494646') && signature.includes('57454250')) return 'WebP'
  if (signature.startsWith('0000002066747970617669662d') || signature.startsWith('0000001c66747970617669662d')) return 'AVIF'  
  if (signature.startsWith('89504e47')) return 'PNG'
  if (signature.startsWith('ffd8ff')) return 'JPEG'
  if (signature.startsWith('474946383761') || signature.startsWith('474946383961')) return 'GIF'
  if (signature.includes('3c737667') || signature.includes('3c3f786d6c')) return 'SVG'
  
  return `Unknown`
}

export type UploadPlatform = 'server' | 'vercel'
export type AssetType = 'logo' | 'favicon' | 'product' | 'product-alt' | 'product-variant' | 'brand' | 'user' | 'banner' | 'mini-banner' | 'page'

interface UploadResult {
  success: boolean
  url?: string
  urls?: { large?: string; medium?: string; small?: string }
  path?: string
  error?: string
}

// Get current platform with smart detection
async function getCurrentPlatform(): Promise<UploadPlatform> {
  try {
    // First, check environment variables for Vercel
    if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL) {
      console.log('🔍 [PLATFORM] Vercel environment detected from env vars')
      console.log('   - VERCEL:', !!process.env.VERCEL)
      console.log('   - VERCEL_ENV:', process.env.VERCEL_ENV)
      console.log('   - VERCEL_URL:', !!process.env.VERCEL_URL)
      console.log('   - BLOB_READ_WRITE_TOKEN:', !!process.env.BLOB_READ_WRITE_TOKEN)
      return 'vercel'
    }

    // Next, try to get from settings
    console.log('🔍 [PLATFORM] Checking settings...')
    const settings = await getSettings('general')
    console.log('🔍 [PLATFORM] Settings retrieved:', settings)
    
    if (settings.platform === 'vercel') {
      console.log('✅ [PLATFORM] Vercel platform from settings')
      return 'vercel'
    } else if (settings.platform === 'server') {
      console.log('✅ [PLATFORM] Server platform from settings')
      return 'server'
    }
    
    // Fallback to environment detection
    console.log('🔍 [PLATFORM] Using environment detection fallback...')
    const deploymentEnv = detectServerDeploymentEnvironment()
    const fallbackPlatform = deploymentEnv.platform === 'vercel' ? 'vercel' : 'server'
    console.log(`✅ [PLATFORM] Fallback platform: ${fallbackPlatform}`)
    return fallbackPlatform
    
  } catch (error) {
    console.warn('⚠️ [PLATFORM] Error in platform detection, using environment fallback:', error)
    
    // Final fallback - check environment again
    if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL) {
      console.log('✅ [PLATFORM] Final fallback: Vercel (from env)')
      return 'vercel'
    } else {
      console.log('✅ [PLATFORM] Final fallback: Server')
      return 'server'
    }
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
    // Debug: Check what the current working directory actually is
    console.log('🔍 DEBUG - process.cwd():', process.cwd())
    
    // Create media directories if they don't exist - use media path (cwd is already client directory)
    const baseMediaDir = join(process.cwd(), 'media')
    console.log('🔍 DEBUG - baseMediaDir:', baseMediaDir)
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
    
    console.log('🔍 DEBUG - targetDir:', targetDir)
    console.log('🔍 DEBUG - baseMediaDir exists?', existsSync(baseMediaDir))
    console.log('🔍 DEBUG - targetDir exists?', existsSync(targetDir))
    
    if (!existsSync(baseMediaDir)) {
      console.log('🔧 Creating baseMediaDir:', baseMediaDir)
      await mkdir(baseMediaDir, { recursive: true })
    }
    
    if (!existsSync(targetDir)) {
      console.log('🔧 Creating targetDir:', targetDir)
      await mkdir(targetDir, { recursive: true })
    }
    
    // Use original filename exactly as provided - NO MODIFICATIONS
    console.log('🎨 PRESERVING ORIGINAL FILENAME - NO SANITIZATION')
    const originalFilename = originalName // Keep exact original name
    console.log('🎨 Original filename will be preserved:', originalFilename)
    
    // Still need these variables for product images
    const timestamp = Date.now()
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
    
    console.log('🎨 DEBUG - Original filename preserved:', originalFilename)
    
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
      // Use original filename exactly - NO timestamp or type prefix
      filename = originalFilename
      filePath = join(targetDir, filename)
      
      let processedBuffer: Buffer
      
      // Upload ALL images as-is without ANY processing or resizing
      console.log('🎨 DEBUG - Uploading as-is with original filename:', originalFilename)
      console.log('🎨 DEBUG - Original buffer size:', buffer.length, 'bytes')
      console.log('📸 NO PROCESSING - Uploading original file')
      
      // Use original buffer for all formats - no Sharp processing at all
      processedBuffer = buffer
      
      console.log('✅ Processing complete - output size:', processedBuffer.length, 'bytes')
      
      console.log('💾 EXPERT FILE WRITE ANALYSIS')
      console.log('  Target path:', filePath)
      console.log('  Buffer size:', processedBuffer.length, 'bytes')
      console.log('  Directory exists:', existsSync(targetDir))
      console.log('  Parent directory writable:', await checkDirectoryWritable(targetDir))
      
      // Check file extension and buffer compatibility
      const detectedType = detectFileTypeFromBuffer(processedBuffer)
      console.log('  Detected file type from buffer:', detectedType)
      console.log('  Extension matches buffer:', extension === detectedType.toLowerCase())
      
      try {
        await writeFile(filePath, processedBuffer)
        console.log('  ✅ File written successfully')
        
        // Verify write success
        if (existsSync(filePath)) {
          const writtenFileSize = (await import('fs')).statSync(filePath).size
          console.log('  ✅ File exists after write')
          console.log('  ✅ Written file size:', writtenFileSize, 'bytes')
          console.log('  ✅ Size match:', writtenFileSize === processedBuffer.length ? '✅' : '❌')
        } else {
          console.error('  ❌ File does not exist after write')
        }
      } catch (writeError) {
        console.error('❌ File write error:', writeError)
        console.error('  Error type:', writeError.constructor.name)
        console.error('  Error message:', writeError.message)
        console.error('  Error code:', (writeError as any).code)
        throw writeError
      }
      
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
      // Use original filename exactly - NO MODIFICATIONS for Vercel
      console.log('🎨 VERCEL - PRESERVING ORIGINAL FILENAME - NO SANITIZATION')
      const originalFilename = originalName // Keep exact original name
      console.log('🎨 VERCEL - Original filename will be preserved:', originalFilename)
      
      let filePath: string
      if (type === 'brand') {
        filePath = `brands/${originalFilename}`
      } else if (type === 'user') {
        filePath = `users/${originalFilename}`
      } else if (type === 'banner') {
        filePath = `main-banners/${originalFilename}`
      } else if (type === 'mini-banner') {
        filePath = `mini-banners/${originalFilename}`
      } else if (type === 'page') {
        filePath = `pages/${originalFilename}`
      } else {
        filePath = `site/${originalFilename}`
      }
      
      let processedBuffer: Buffer
      
      // Upload ALL images as-is without ANY processing or resizing (Vercel)
      console.log('🎨 DEBUG - Uploading as-is (Vercel) with original filename:', originalFilename)
      console.log('📸 NO PROCESSING - Uploading original file (Vercel)')
      
      // Use original buffer for all formats - no Sharp processing at all
      processedBuffer = buffer
      
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
    console.log('🔬 EXPERT ASSET UPLOAD ANALYSIS')
    console.log('📊 Node.js Environment:')
    console.log('  Node Version:', process.version)
    console.log('  Platform:', process.platform)
    console.log('  Arch:', process.arch)
    console.log('  Memory Usage:', process.memoryUsage())
    
    const platform = forcePlatform || await getCurrentPlatform()
    
    // Expert buffer analysis
    console.log('📊 File Processing:')
    console.log('  Original file size:', file.size, 'bytes')
    console.log('  File type:', file.type)
    console.log('  File name:', file.name)
    
    let buffer: Buffer
    try {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      console.log('  ✅ ArrayBuffer → Buffer conversion successful')
      console.log('  Buffer size:', buffer.length, 'bytes')
      console.log('  Size match:', buffer.length === file.size ? '✅' : '❌')
    } catch (bufferError) {
      console.error('❌ Buffer conversion failed:', bufferError)
      throw new Error(`Buffer conversion failed: ${bufferError}`)
    }
    
    console.log(`🎯 Uploading ${type} to ${platform} platform`, options)
    
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

// Platform-aware directory listing functions
export interface PlatformFileInfo {
  name: string
  size: number
  type: string
  lastModified: Date
  url: string
  isImage: boolean
}

export interface PlatformDirectoryInfo {
  id: string
  name: string
  path: string
  description: string
  icon: string
  fileCount: number
  totalSize: number
  lastModified: Date
}

// Get path mapping for different asset types
function getAssetPath(type: AssetType): string {
  switch (type) {
    case 'product':
    case 'product-alt':
    case 'product-variant':
      return 'products'
    case 'brand':
      return 'brands'
    case 'user':
      return 'users'
    case 'banner':
      return 'main-banners'
    case 'mini-banner':
      return 'mini-banners'
    case 'page':
      return 'pages'
    default:
      return 'site'
  }
}

// List files from server storage
async function listServerFiles(directoryPath: string): Promise<PlatformFileInfo[]> {
  try {
    const { readdir, stat } = await import('fs/promises')
    const fullPath = join(process.cwd(), 'media', directoryPath)
    
    if (!existsSync(fullPath)) {
      return []
    }

    const files = await readdir(fullPath)
    const fileInfos: PlatformFileInfo[] = []

    for (const file of files) {
      const filePath = join(fullPath, file)
      try {
        const fileStat = await stat(filePath)
        if (fileStat.isFile()) {
          const extension = file.split('.').pop()?.toLowerCase() || ''
          const isImage = [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg',
            'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif'
          ].includes(extension)

          fileInfos.push({
            name: file,
            size: fileStat.size,
            type: extension,
            lastModified: fileStat.mtime,
            url: `/media/${directoryPath}/${file}`,
            isImage
          })
        }
      } catch (err) {
        continue
      }
    }

    return fileInfos.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  } catch (error) {
    console.error(`Error listing server files for ${directoryPath}:`, error)
    return []
  }
}

// List files from Vercel blob storage with pagination
async function listVercelFiles(directoryPath: string): Promise<PlatformFileInfo[]> {
  try {
    const tokenExists = !!process.env.BLOB_READ_WRITE_TOKEN
    const hasBlob = typeof process.env.BLOB_READ_WRITE_TOKEN === 'string' && process.env.BLOB_READ_WRITE_TOKEN.length > 0
    
    if (!tokenExists || !hasBlob) {
      console.error('🔒 BLOB_READ_WRITE_TOKEN issue detected:')
      console.error('   - tokenExists:', tokenExists)
      console.error('   - hasBlob:', hasBlob)
      console.error('   - tokenLength:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0)
      console.error('   - allBlobEnvs:', Object.keys(process.env).filter(key => key.includes('BLOB')))
      console.warn('📋 To enable Vercel storage, set BLOB_READ_WRITE_TOKEN in environment variables')
      return []
    }

    console.log(`🔍 [VERCEL-FILES] Searching for directory: "${directoryPath}"`)
    
    // Enhanced prefix patterns with better matching
    const prefixPatterns = [
      `${directoryPath}/`,           // Standard: brands/
      directoryPath + '/',           // Ensure slash: brands/
      directoryPath,                 // Without slash: brands
      `media/${directoryPath}/`,     // With media prefix: media/brands/
      `media/${directoryPath}`,      // Media prefix no slash: media/brands
    ]

    let allBlobs: any[] = []
    let successfulPrefix = ''
    
    // First, let's see what's actually in storage for debugging
    try {
      const { blobs: sampleBlobs } = await list({ limit: 10 })
      console.log(`🔍 [DEBUG] Sample paths in storage:`, sampleBlobs.map(b => `"${b.pathname}"`).slice(0, 5))
      
      // Check if any sample paths start with our target directory
      const matchingPaths = sampleBlobs.filter(b => 
        b.pathname.startsWith(directoryPath + '/') || 
        b.pathname.startsWith(directoryPath)
      )
      console.log(`🔍 [DEBUG] Paths matching "${directoryPath}":`, matchingPaths.map(b => b.pathname))
    } catch (debugError) {
      console.warn('🔍 [DEBUG] Could not fetch sample paths:', debugError)
    }
    
    // Try each prefix pattern with pagination
    for (const prefix of prefixPatterns) {
      try {
        console.log(`🔍 [VERCEL-FILES] Trying prefix: "${prefix}" with pagination...`)
        
        let cursor: string | undefined
        let pageCount = 0
        const maxPages = 50 // Safety limit to prevent infinite loops
        let prefixTotalBlobs: any[] = []
        
        // Fetch all pages for this prefix
        do {
          pageCount++
          console.log(`📄 [VERCEL-FILES] Fetching page ${pageCount} for prefix "${prefix}"${cursor ? ` (cursor: ${cursor.substring(0, 20)}...)` : ''}`)
          
          const result = await list({ 
            prefix, 
            limit: 100, // Smaller batches to reduce timeout risk
            cursor 
          })
          
          console.log(`📊 [VERCEL-FILES] Page ${pageCount}: ${result.blobs.length} blobs, hasMore: ${result.hasMore}`)
          
          prefixTotalBlobs = prefixTotalBlobs.concat(result.blobs)
          cursor = result.cursor
          
          // Safety check
          if (pageCount >= maxPages) {
            console.warn(`⚠️ [VERCEL-FILES] Reached max pages (${maxPages}) for prefix "${prefix}"`)
            break
          }
        } while (cursor)
        
        console.log(`📊 [VERCEL-FILES] Total found with prefix "${prefix}": ${prefixTotalBlobs.length} blobs across ${pageCount} pages`)
        
        // Log first few pathnames for debugging
        if (prefixTotalBlobs.length > 0) {
          console.log(`📋 [VERCEL-FILES] Sample files:`, prefixTotalBlobs.slice(0, 3).map(b => b.pathname))
          allBlobs = prefixTotalBlobs
          successfulPrefix = prefix
          console.log(`✅ [VERCEL-FILES] SUCCESS with prefix: "${prefix}" (${prefixTotalBlobs.length} total files)`)
          break
        }
      } catch (prefixError) {
        console.warn(`⚠️ [VERCEL-FILES] Error with prefix "${prefix}":`, prefixError)
      }
    }

    // If still no results, try a broader paginated search and filter manually
    if (allBlobs.length === 0) {
      console.warn(`🔍 [VERCEL-FILES] No files found with prefix patterns, trying paginated broad search...`)
      try {
        let cursor: string | undefined
        let pageCount = 0
        const maxPages = 20 // Limit for broad search
        let allBlobsInStorage: any[] = []
        
        // Fetch all pages of all blobs
        do {
          pageCount++
          console.log(`📄 [VERCEL-FILES] Broad search page ${pageCount}${cursor ? ` (cursor: ${cursor.substring(0, 20)}...)` : ''}`)
          
          const result = await list({ 
            limit: 100, 
            cursor 
          })
          
          console.log(`📊 [VERCEL-FILES] Broad page ${pageCount}: ${result.blobs.length} blobs, hasMore: ${result.hasMore}`)
          allBlobsInStorage = allBlobsInStorage.concat(result.blobs)
          cursor = result.cursor
          
          if (pageCount >= maxPages) {
            console.warn(`⚠️ [VERCEL-FILES] Reached max pages (${maxPages}) for broad search`)
            break
          }
        } while (cursor)
        
        console.log(`📋 [VERCEL-FILES] Total blobs in storage: ${allBlobsInStorage.length}`)
        
        // Manual filtering for files that belong to this directory
        const filteredBlobs = allBlobsInStorage.filter(blob => {
          const pathParts = blob.pathname.split('/')
          // Match exact directory name (brands matches brands/file.jpg)
          return pathParts.length >= 2 && pathParts[0] === directoryPath
        })
        
        console.log(`📋 [VERCEL-FILES] Manually filtered ${filteredBlobs.length} files for "${directoryPath}"`)
        allBlobs = filteredBlobs
        successfulPrefix = 'manual-filter-paginated'
        
        if (filteredBlobs.length > 0) {
          console.log(`✅ [VERCEL-FILES] SUCCESS with manual filtering`)
          console.log(`📋 [VERCEL-FILES] Found files:`, filteredBlobs.slice(0, 3).map(b => b.pathname))
        }
      } catch (broadError) {
        console.error('❌ [VERCEL-FILES] Paginated broad search failed:', broadError)
      }
    }

    if (allBlobs.length === 0) {
      console.warn(`⚠️ [VERCEL-FILES] No files found for directory "${directoryPath}"`)
      return []
    }

    const fileInfos: PlatformFileInfo[] = allBlobs.map(blob => {
      const filename = blob.pathname.split('/').pop() || ''
      const extension = filename.split('.').pop()?.toLowerCase() || ''
      const isImage = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg',
        'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif'
      ].includes(extension)

      return {
        name: filename,
        size: blob.size,
        type: extension,
        lastModified: blob.uploadedAt,
        url: blob.url,
        isImage
      }
    })

    console.log(`✅ [VERCEL-FILES] Returning ${fileInfos.length} files for "${directoryPath}" using ${successfulPrefix}`)
    return fileInfos.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  } catch (error) {
    console.error(`❌ [VERCEL-FILES] Error listing files for ${directoryPath}:`, error)
    console.error('💡 This could be due to missing BLOB_READ_WRITE_TOKEN or network issues')
    return []
  }
}

// Platform-aware file listing with hybrid fallback
export async function listPlatformFiles(
  directoryPath: string,
  forcePlatform?: UploadPlatform
): Promise<PlatformFileInfo[]> {
  const platform = forcePlatform || await getCurrentPlatform()
  
  console.log(`📁 [PLATFORM-FILES] Listing files from "${platform}" platform for directory: "${directoryPath}"`)
  console.log(`📁 [PLATFORM-FILES] forcePlatform:`, forcePlatform)
  console.log(`📁 [PLATFORM-FILES] Environment check:`)
  console.log(`   - VERCEL:`, !!process.env.VERCEL)
  console.log(`   - VERCEL_ENV:`, process.env.VERCEL_ENV)
  console.log(`   - VERCEL_URL:`, !!process.env.VERCEL_URL)
  console.log(`   - BLOB_READ_WRITE_TOKEN:`, !!process.env.BLOB_READ_WRITE_TOKEN)
  
  try {
    if (platform === 'vercel') {
      const vercelFiles = await listVercelFiles(directoryPath)
      
      // If no files in Vercel, try to fall back to server files
      if (vercelFiles.length === 0) {
        console.log(`🔄 No files found in Vercel for ${directoryPath}, trying server storage as fallback...`)
        try {
          const serverFiles = await listServerFiles(directoryPath)
          
          if (serverFiles.length > 0) {
            console.log(`📋 Found ${serverFiles.length} files in server storage`)
            // Mark server files with a source indicator but keep them functional
            return serverFiles.map(file => ({
              ...file,
              name: `${file.name} (from server)`,
              url: file.url
            }))
          }
        } catch (serverError) {
          console.warn('Server storage also unavailable:', serverError)
        }
      }
      
      return vercelFiles
    } else {
      // Server platform
      const serverFiles = await listServerFiles(directoryPath)
      
      // If no server files, try Vercel as fallback (for migration scenarios)
      if (serverFiles.length === 0) {
        console.log(`🔄 No files found in server for ${directoryPath}, trying Vercel storage as fallback...`)
        try {
          const vercelFiles = await listVercelFiles(directoryPath)
          
          if (vercelFiles.length > 0) {
            console.log(`📋 Found ${vercelFiles.length} files in Vercel storage`)
            return vercelFiles.map(file => ({
              ...file,
              name: `${file.name} (from Vercel)`
            }))
          }
        } catch (vercelError) {
          console.warn('Vercel storage also unavailable:', vercelError)
        }
      }
      
      return serverFiles
    }
  } catch (error) {
    console.error(`❌ Error in listPlatformFiles for ${directoryPath}:`, error)
    return []
  }
}

// Get directory info with platform awareness (optimized - no size calculation)
export async function getPlatformDirectoryInfo(
  directoryId: string,
  directoryConfig: { id: string; name: string; path: string; description: string; icon: string },
  forcePlatform?: UploadPlatform
): Promise<PlatformDirectoryInfo> {
  const platform = forcePlatform || await getCurrentPlatform()
  console.log(`📂 [DIR-INFO] Getting info for "${directoryId}" using platform: "${platform}"`)
  const files = await listPlatformFiles(directoryConfig.path, platform)
  
  const fileCount = files.length
  const lastModified = files.length > 0 
    ? new Date(Math.max(...files.map(f => new Date(f.lastModified).getTime())))
    : new Date()

  return {
    id: directoryConfig.id,
    name: directoryConfig.name,
    path: directoryConfig.path,
    description: directoryConfig.description,
    icon: directoryConfig.icon,
    fileCount,
    totalSize: 0, // Removed size calculation for performance
    lastModified
  }
}

// Export additional utility functions
export { getCurrentPlatform }