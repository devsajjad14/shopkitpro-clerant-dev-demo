'use server'

import { put, del, list } from '@vercel/blob'
import sharp from 'sharp'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { detectServerDeploymentEnvironment } from '@/lib/utils/server-deployment-detection'

export type MediaCategory = 'products' | 'main-banners' | 'mini-banners' | 'brands' | 'site' | 'users' | 'pages'

interface MediaUploadResult {
  success: boolean
  url?: string
  originalFilename: string
  error?: string
  replaced?: boolean
}

// Media directories mapping for server storage
const MEDIA_DIRECTORIES = {
  'products': 'media/products',
  'main-banners': 'media/main-banners', 
  'mini-banners': 'media/mini-banners',
  'brands': 'media/brands',
  'site': 'media/site',
  'users': 'media/users',
  'pages': 'media/pages',
} as const

// Vercel blob folder mapping
const VERCEL_FOLDERS = {
  'products': 'products',
  'main-banners': 'main-banners',
  'mini-banners': 'mini-banners', 
  'brands': 'brands',
  'site': 'site',
  'users': 'users',
  'pages': 'pages',
} as const

/**
 * Upload media file to server storage with original filename
 * Replaces existing file if present
 */
async function uploadToServerMedia(
  file: File,
  category: MediaCategory
): Promise<MediaUploadResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const originalFilename = file.name
    
    // Create media directory structure
    const baseMediaDir = join(process.cwd(), 'media')
    const targetDir = join(process.cwd(), MEDIA_DIRECTORIES[category])
    
    if (!existsSync(baseMediaDir)) {
      await mkdir(baseMediaDir, { recursive: true })
    }
    
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }
    
    const filePath = join(targetDir, originalFilename)
    const publicUrl = `/${MEDIA_DIRECTORIES[category]}/${originalFilename}`.replace(/\\/g, '/')
    
    // Check if file already exists
    const fileExists = existsSync(filePath)
    
    console.log(`📁 ${fileExists ? 'Replacing' : 'Creating'} server file: ${originalFilename} in ${category}`)
    
    // Process image with reasonable quality
    let processedBuffer: Buffer
    
    if (file.type.startsWith('image/')) {
      // Optimize image while maintaining quality
      processedBuffer = await sharp(buffer)
        .jpeg({ quality: 92, progressive: true })
        .png({ quality: 95, compressionLevel: 6 })
        .webp({ quality: 94 })
        .toBuffer()
    } else {
      processedBuffer = buffer
    }
    
    // Write file (replaces existing)
    await writeFile(filePath, processedBuffer)
    
    console.log(`✅ Server media uploaded: ${originalFilename} → ${publicUrl}`)
    
    return {
      success: true,
      url: publicUrl,
      originalFilename,
      replaced: fileExists
    }
  } catch (error) {
    console.error(`❌ Server media upload failed for ${file.name}:`, error)
    return {
      success: false,
      originalFilename: file.name,
      error: `Server upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Upload media file to Vercel blob with versioned filename for reliability
 * Uses unique filename to avoid all caching issues
 */
async function uploadToVercelMedia(
  file: File,
  category: MediaCategory,
  isReplacement: boolean = false
): Promise<MediaUploadResult> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not configured')
    }

    const originalFilename = file.name
    
    // Always use original filename - handle cache busting through URL parameters instead
    const actualFilename = originalFilename
    const blobPath = `${VERCEL_FOLDERS[category]}/${originalFilename}`
    
    console.log(`☁️ Vercel upload - using original filename: ${originalFilename}`)
    console.log(`🔄 Is replacement: ${isReplacement}`)
    
    console.log(`☁️ Processing Vercel blob upload:`)
    console.log(`  Original: ${originalFilename}`)
    console.log(`  Actual: ${actualFilename}`)
    console.log(`  Path: ${blobPath}`)
    console.log(`  Is Replacement: ${isReplacement}`)
    
    // For replacements, the old file was already deleted by the frontend
    // For new files with same name, Vercel will automatically replace them
    console.log(`📤 Uploading file: ${actualFilename}`)
    console.log(`🔄 Will ${isReplacement ? 'replace existing' : 'create/overwrite'} file`)
    
    const replacementAttempted = isReplacement
    
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Process image with reasonable quality
    let processedBuffer: Buffer
    
    if (file.type.startsWith('image/')) {
      processedBuffer = await sharp(buffer)
        .jpeg({ quality: 92, progressive: true })
        .png({ quality: 95, compressionLevel: 6 })
        .webp({ quality: 94 })
        .toBuffer()
    } else {
      processedBuffer = buffer
    }
    
    // Upload to Vercel blob with original filename and overwrite capability
    const blob = await put(blobPath, processedBuffer, {
      access: 'public',
      addRandomSuffix: false, // Keep original filename
      allowOverwrite: true, // Allow overwriting existing files
      contentType: file.type,
      cacheControlMaxAge: 0 // Disable caching for immediate updates
    })
    
    console.log(`📤 Upload completed, new blob URL: ${blob.url}`)
    
    // Additional verification: check if new upload is available
    try {
      const { blobs: newBlobs } = await list({ prefix: blobPath, limit: 1 })
      if (newBlobs.length > 0) {
        const newBlobUrl = newBlobs[0].url
        console.log(`✅ New upload verified, blob URL: ${newBlobUrl}`)
      }
    } catch (verifyError) {
      console.log(`⚠️ Could not verify new upload:`, verifyError)
    }
    
    // For replacements, add cache-busting parameter to ensure fresh URLs
    let finalUrl = blob.url
    if (isReplacement) {
      const cacheBuster = `v=${Date.now()}&t=${Math.random().toString(36).substring(2, 8)}`
      finalUrl = `${blob.url}?${cacheBuster}`
      console.log(`🔄 Added cache-busting to replacement URL: ${finalUrl}`)
    }
    
    console.log(`✅ Vercel blob uploaded: ${originalFilename} → ${finalUrl}`)
    
    return {
      success: true,
      url: finalUrl,
      originalFilename,
      replaced: isReplacement || replacementAttempted
    }
  } catch (error) {
    console.error(`❌ Vercel blob upload failed for ${file.name}:`, error)
    return {
      success: false,
      originalFilename: file.name,
      error: `Vercel upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Upload media file preserving original filename with platform-aware replacement
 */
export async function uploadMediaFile(
  file: File,
  category: MediaCategory,
  forcePlatform?: 'server' | 'vercel' | null,
  isReplacement?: boolean
): Promise<MediaUploadResult> {
  try {
    // Validate file
    if (!file || !file.name) {
      return {
        success: false,
        originalFilename: 'unknown',
        error: 'Invalid file provided'
      }
    }

    // Validate category
    if (!MEDIA_DIRECTORIES[category]) {
      return {
        success: false,
        originalFilename: file.name,
        error: `Invalid category: ${category}`
      }
    }

    console.log(`📤 Starting media upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) → ${category}`)
    
    // Determine platform: use forced platform or auto-detect
    let effectivePlatform: 'server' | 'vercel'
    
    if (forcePlatform) {
      effectivePlatform = forcePlatform
      console.log(`🎯 Using forced platform: ${forcePlatform}`)
    } else {
      const deploymentEnv = detectServerDeploymentEnvironment()
      effectivePlatform = deploymentEnv.platform
      console.log(`🔍 Auto-detected platform: ${effectivePlatform}`)
    }
    
    if (effectivePlatform === 'vercel') {
      return await uploadToVercelMedia(file, category, isReplacement || false)
    } else {
      return await uploadToServerMedia(file, category)
    }
  } catch (error) {
    console.error('❌ Media upload error:', error)
    return {
      success: false,
      originalFilename: file.name || 'unknown',
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Batch upload multiple media files with original filenames
 */
export async function uploadMediaFiles(
  files: { file: File; category: MediaCategory }[],
  forcePlatform?: 'server' | 'vercel' | null,
  isReplacement?: boolean
): Promise<MediaUploadResult[]> {
  console.log(`🚀 Starting batch media upload: ${files.length} files`)
  console.log(`🎯 Force platform: ${forcePlatform || 'auto-detect'}`)
  
  const results: MediaUploadResult[] = []
  
  // Process files with controlled concurrency
  const BATCH_SIZE = 3
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    
    const batchPromises = batch.map(({ file, category }) => 
      uploadMediaFile(file, category, forcePlatform, isReplacement)
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Small delay between batches
    if (i + BATCH_SIZE < files.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  const stats = {
    total: results.length,
    successful: results.filter(r => r.success).length,
    replaced: results.filter(r => r.replaced).length,
    failed: results.filter(r => !r.success).length
  }
  
  console.log(`🎉 Batch media upload completed:`, stats)
  
  return results
}