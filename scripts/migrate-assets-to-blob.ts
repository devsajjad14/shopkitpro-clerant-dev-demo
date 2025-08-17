#!/usr/bin/env tsx

/**
 * Enterprise Asset Migration to Vercel Blob Storage
 * 
 * This script migrates local demo media files to Vercel Blob storage
 * to resolve the 388MB serverless function size limit issue.
 * 
 * Usage:
 * - Development: npx tsx scripts/migrate-assets-to-blob.ts
 * - Production: Set BLOB_READ_WRITE_TOKEN and run migration
 */

import { put } from '@vercel/blob'
import { readdir, readFile, stat } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'

// Configuration
const DEMO_MEDIA_PATH = join(process.cwd(), 'demo-media')
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB limit per file
const BATCH_SIZE = 10 // Upload 10 files at once

// Media categories mapping
const CATEGORY_MAPPING = {
  'brands': 'brands',
  'main-banners': 'main-banners', 
  'mini-banners': 'mini-banners',
  'pages': 'pages',
  'products': 'products',
} as const

// Supported file extensions
const MEDIA_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif',
  '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP', '.SVG', '.AVIF'
]

interface MigrationStats {
  totalFiles: number
  uploadedFiles: number
  skippedFiles: number
  errorFiles: number
  totalSize: number
  uploadedSize: number
  categories: Record<string, number>
}

async function main() {
  console.log('🚀 Starting Enterprise Asset Migration to Vercel Blob Storage')
  console.log('=' .repeat(70))
  
  // Check environment
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is required')
    console.log('💡 Add BLOB_READ_WRITE_TOKEN to your .env file')
    process.exit(1)
  }
  
  // Check if demo-media exists
  if (!existsSync(DEMO_MEDIA_PATH)) {
    console.log('ℹ️  No demo-media directory found - nothing to migrate')
    return
  }
  
  const stats: MigrationStats = {
    totalFiles: 0,
    uploadedFiles: 0,
    skippedFiles: 0,
    errorFiles: 0,
    totalSize: 0,
    uploadedSize: 0,
    categories: {}
  }
  
  try {
    // Scan demo-media directory
    console.log('🔍 Scanning demo-media directory...')
    const categories = await readdir(DEMO_MEDIA_PATH)
    
    for (const category of categories) {
      const categoryPath = join(DEMO_MEDIA_PATH, category)
      const categoryStat = await stat(categoryPath)
      
      if (!categoryStat.isDirectory()) {
        console.log(`⚠️  Skipping non-directory: ${category}`)
        continue
      }
      
      // Map to blob folder name
      const blobCategory = CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING] || category
      stats.categories[blobCategory] = 0
      
      console.log(`\n📁 Processing category: ${category} -> ${blobCategory}`)
      
      // Get all files in category
      const files = await readdir(categoryPath)
      const mediaFiles = files.filter(file => 
        MEDIA_EXTENSIONS.includes(extname(file))
      )
      
      console.log(`   Found ${mediaFiles.length} media files`)
      stats.totalFiles += mediaFiles.length
      
      // Process files in batches
      for (let i = 0; i < mediaFiles.length; i += BATCH_SIZE) {
        const batch = mediaFiles.slice(i, i + BATCH_SIZE)
        const batchPromises = batch.map(file => 
          uploadFile(categoryPath, file, blobCategory, stats)
        )
        
        await Promise.allSettled(batchPromises)
        
        // Progress update
        const progress = Math.round(((i + batch.length) / mediaFiles.length) * 100)
        console.log(`   Progress: ${progress}% (${i + batch.length}/${mediaFiles.length})`)
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
  
  // Print final stats
  console.log('\n' + '='.repeat(70))
  console.log('📊 Migration Complete - Final Statistics')
  console.log('='.repeat(70))
  console.log(`Total files processed: ${stats.totalFiles}`)
  console.log(`Successfully uploaded: ${stats.uploadedFiles}`)
  console.log(`Skipped files: ${stats.skippedFiles}`)
  console.log(`Error files: ${stats.errorFiles}`)
  console.log(`Total size: ${formatBytes(stats.totalSize)}`)
  console.log(`Uploaded size: ${formatBytes(stats.uploadedSize)}`)
  
  console.log('\n📁 Files by category:')
  Object.entries(stats.categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} files`)
  })
  
  if (stats.uploadedFiles > 0) {
    console.log('\n✅ Migration successful!')
    console.log('💡 You can now safely delete the demo-media directory')
    console.log('💡 Run: rm -rf demo-media')
  }
}

async function uploadFile(
  categoryPath: string, 
  filename: string, 
  blobCategory: string, 
  stats: MigrationStats
): Promise<void> {
  try {
    const filePath = join(categoryPath, filename)
    const fileStats = await stat(filePath)
    
    stats.totalSize += fileStats.size
    
    // Check file size limit
    if (fileStats.size > MAX_FILE_SIZE) {
      console.log(`   ⚠️  Skipping large file: ${filename} (${formatBytes(fileStats.size)})`)
      stats.skippedFiles++
      return
    }
    
    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Generate blob path with versioning
    const timestamp = Date.now()
    const ext = extname(filename)
    const basename = filename.replace(ext, '')
    const blobPath = `${blobCategory}/${basename}_v${timestamp}_${generateId()}${ext}`
    
    // Upload to Vercel Blob
    const result = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType: getMimeType(ext),
    })
    
    console.log(`   ✅ Uploaded: ${filename} -> ${result.url}`)
    stats.uploadedFiles++
    stats.uploadedSize += fileStats.size
    stats.categories[blobCategory]++
    
  } catch (error) {
    console.error(`   ❌ Failed to upload ${filename}:`, error)
    stats.errorFiles++
  }
}

function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
  }
  
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// CLI check
if (require.main === module) {
  main().catch(console.error)
}

export { main as migrateAssetsToBlob }