import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

// Content type detection for all file types
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.ico': 'image/x-icon',
    '.apng': 'image/apng',
    
    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.csv': 'text/csv',
    
    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    
    // Video
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.webm': 'video/webm',
    
    // Archives
    '.zip': 'application/zip',
    '.rar': 'application/vnd.rar',
    '.7z': 'application/x-7z-compressed',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
    
    // Other
    '.sketch': 'application/octet-stream',
    '.psd': 'application/octet-stream',
    '.ai': 'application/postscript',
    '.eps': 'application/postscript',
  }
  
  return contentTypes[ext] || 'application/octet-stream'
}

// Recursively get all files in a directory
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
      const filePath = path.join(dirPath, file)
      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
      } else {
        arrayOfFiles.push(filePath)
      }
    })

    return arrayOfFiles
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return arrayOfFiles
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting media upload to Vercel Blob...')

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const mediaDir = path.join(process.cwd(), 'media')
          
          // Check if media directory exists
          if (!fs.existsSync(mediaDir)) {
            controller.enqueue(encoder.encode(JSON.stringify({
              type: 'error',
              message: 'Media directory not found. Please create client/media directory first.'
            }) + '\n'))
            controller.close()
            return
          }

          // Get all files from media directory
          console.log('📋 Scanning local media directory...')
          const allFiles = getAllFiles(mediaDir)
          
          // Filter out ONLY system files - allow ALL other file types
          const mediaFiles = allFiles.filter(file => {
            const relativePath = path.relative(mediaDir, file)
            const fileName = path.basename(file).toLowerCase()
            
            // Only exclude system/hidden files
            const isSystemFile = relativePath.startsWith('.') || 
                                relativePath.includes('/.') ||
                                fileName === 'thumbs.db' ||
                                fileName === '.ds_store' ||
                                fileName === 'desktop.ini' ||
                                fileName.startsWith('~')
            
            if (isSystemFile) {
              console.log(`🚫 Skipping system file: ${relativePath}`)
              return false
            }
            
            // Log all files being included (for debugging)
            const ext = path.extname(file).toLowerCase()
            console.log(`✅ Including file: ${relativePath} (${ext || 'no extension'})`)
            return true
          })

          console.log(`📊 Found ${mediaFiles.length} files to upload`)

          // Enterprise-level duplicate detection with comprehensive blob analysis
          console.log('🔍 Performing comprehensive Vercel Blob analysis...')
          console.log('📊 BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN)
          
          const { blobs } = await list({
            token: process.env.BLOB_READ_WRITE_TOKEN
            // NO LIMITS - get absolutely ALL existing files
          })
          
          // Create comprehensive lookup maps for intelligent duplicate detection
          const existingFilesByPath = new Map<string, any>()
          const existingFilesByName = new Map<string, any[]>()
          const existingFileStats = {
            totalSize: 0,
            byExtension: new Map<string, number>(),
            byDirectory: new Map<string, number>()
          }
          
          // Analyze existing blobs with detailed metadata
          blobs.forEach(blob => {
            const normalizedPath = blob.pathname.replace(/\\/g, '/')
            const fileName = path.basename(normalizedPath)
            const directory = path.dirname(normalizedPath)
            const extension = path.extname(fileName).toLowerCase()
            
            // Store by exact path for precise matching
            existingFilesByPath.set(normalizedPath, blob)
            
            // Store by filename for alternative matching
            if (!existingFilesByName.has(fileName)) {
              existingFilesByName.set(fileName, [])
            }
            existingFilesByName.get(fileName)!.push(blob)
            
            // Collect statistics
            existingFileStats.totalSize += blob.size
            existingFileStats.byExtension.set(extension, (existingFileStats.byExtension.get(extension) || 0) + 1)
            existingFileStats.byDirectory.set(directory, (existingFileStats.byDirectory.get(directory) || 0) + 1)
          })
          
          console.log(`📊 Comprehensive blob analysis complete:`)
          console.log(`   • Total files: ${blobs.length}`)
          console.log(`   • Total size: ${(existingFileStats.totalSize / 1024 / 1024).toFixed(2)} MB`)
          console.log(`   • Unique directories: ${existingFileStats.byDirectory.size}`)
          console.log(`   • File extensions: ${existingFileStats.byExtension.size}`)
          
          // Log top file types for debugging
          const topExtensions = Array.from(existingFileStats.byExtension.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([ext, count]) => `${ext || 'no-ext'}: ${count}`)
            .join(', ')
          console.log(`   • Top file types: ${topExtensions}`)

          // Send initial progress
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'progress',
            current: 0,
            total: mediaFiles.length,
            phase: 'uploading'
          }) + '\n'))

          // Send stats
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'stats',
            stats: {
              localFiles: mediaFiles.length,
              vercelFiles: blobs.length,
              toUpload: mediaFiles.length,
              toDownload: 0
            }
          }) + '\n'))

          let uploadedCount = 0
          let skippedCount = 0
          let processedCount = 0
          const errors: string[] = []
          const fileTypes = new Map<string, number>()

          // Intelligent file-by-file processing with smart duplicate detection
          console.log('🚀 Starting intelligent file sync with duplicate detection...')
          
          for (const filePath of mediaFiles) {
            try {
              processedCount++
              const relativePath = path.relative(mediaDir, filePath)
              const fileName = relativePath.replace(/\\/g, '/')
              
              console.log(`\n🔍 Processing file ${processedCount}/${mediaFiles.length}: ${relativePath}`)
              
              // Enterprise-level duplicate detection
              const existsOnBlob = existingFilesByPath.has(fileName)
              
              if (existsOnBlob) {
                // File exists - skip it intelligently
                skippedCount++
                const existingBlob = existingFilesByPath.get(fileName)!
                console.log(`⏭️ SKIPPED: ${relativePath} (already exists on Vercel Blob)`)
                console.log(`   📊 Existing file details:`)
                console.log(`   • URL: ${existingBlob.url}`)
                console.log(`   • Size: ${existingBlob.size} bytes`)
                console.log(`   • Uploaded: ${existingBlob.uploadedAt}`)
                
                // Send progress update for skipped file
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'progress',
                  current: processedCount,
                  total: mediaFiles.length,
                  currentFile: relativePath,
                  uploaded: uploadedCount,
                  skipped: skippedCount,
                  action: 'skipped',
                  reason: 'already exists',
                  phase: 'uploading'
                }) + '\n'))
                
              } else {
                // File does not exist - upload it
                console.log(`📤 UPLOADING: ${relativePath} (new file)`)
                
                // Send progress update for uploading
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'progress',
                  current: processedCount,
                  total: mediaFiles.length,
                  currentFile: relativePath,
                  uploaded: uploadedCount,
                  skipped: skippedCount,
                  action: 'uploading',
                  phase: 'uploading'
                }) + '\n'))

                // Read file with error handling
                const fileBuffer = fs.readFileSync(filePath)
                
                // Auto-detect content type for optimal storage
                const ext = path.extname(filePath).toLowerCase()
                const contentType = getContentType(ext)
                
                // Track file types being processed
                const displayExt = ext || 'no-extension'
                fileTypes.set(displayExt, (fileTypes.get(displayExt) || 0) + 1)
                
                console.log(`   📄 File details:`)
                console.log(`   • Type: ${contentType}`)
                console.log(`   • Size: ${fileBuffer.length} bytes`)
                console.log(`   • Extension: ${ext}`)

                // Upload to Vercel Blob with enterprise-grade configuration
                const blob = await put(fileName, fileBuffer, {
                  access: 'public',
                  contentType,
                  token: process.env.BLOB_READ_WRITE_TOKEN
                })

                uploadedCount++
                console.log(`✅ UPLOADED: ${relativePath}`)
                console.log(`   🌐 Blob URL: ${blob.url}`)
                console.log(`   📊 Total uploaded: ${uploadedCount}`)
                
                // Update our internal tracking for subsequent checks
                existingFilesByPath.set(fileName, blob)
              }

            } catch (error) {
              const relativePath = path.relative(mediaDir, filePath)
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              console.error(`❌ ERROR processing ${relativePath}:`, errorMessage)
              
              // Enterprise-level error logging
              if (error instanceof Error) {
                console.error(`   • Error type: ${error.name}`)
                console.error(`   • Error message: ${error.message}`)
                if (error.stack) {
                  console.error(`   • Stack trace: ${error.stack.split('\n').slice(0, 3).join('\n')}`)
                }
              }
              
              errors.push(`${relativePath}: ${errorMessage}`)
              
              // Send error progress update
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'progress',
                current: processedCount,
                total: mediaFiles.length,
                currentFile: relativePath,
                uploaded: uploadedCount,
                skipped: skippedCount,
                action: 'error',
                reason: errorMessage,
                phase: 'uploading'
              }) + '\n'))
            }
          }

          // Prepare intelligent completion summary
          const fileTypeSummary = Array.from(fileTypes.entries())
            .map(([ext, count]) => `${ext}: ${count}`)
            .join(', ')
          
          // Enterprise-grade completion statistics
          console.log('\n🎯 SYNC OPERATION COMPLETED')
          console.log('================================')
          console.log(`📊 Total files processed: ${processedCount}`)
          console.log(`✅ Files uploaded: ${uploadedCount}`)
          console.log(`⏭️ Files skipped: ${skippedCount}`)
          console.log(`❌ Files failed: ${errors.length}`)
          console.log(`📁 File types processed: ${fileTypes.size}`)
          if (fileTypeSummary) {
            console.log(`🏷️ Type breakdown: ${fileTypeSummary}`)
          }
          
          // Send comprehensive completion data
          const successMessage = `Successfully processed ${processedCount} files: ${uploadedCount} uploaded, ${skippedCount} skipped`
          const errorMessage = errors.length > 0 ? `, ${errors.length} failed` : ''
          const typesMessage = fileTypes.size > 0 ? `\nFile types: ${fileTypeSummary}` : ''
          
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'complete',
            totalFiles: uploadedCount,
            skippedFiles: skippedCount,
            processedFiles: processedCount,
            message: successMessage + errorMessage + typesMessage,
            errors: errors,
            fileTypes: Object.fromEntries(fileTypes),
            summary: {
              processed: processedCount,
              uploaded: uploadedCount,
              skipped: skippedCount,
              failed: errors.length,
              success: errors.length === 0
            }
          }) + '\n'))

          console.log(`🎉 Smart sync complete! ${uploadedCount} uploaded, ${skippedCount} skipped, ${errors.length} errors`)

          if (errors.length > 0) {
            console.log('❌ Upload errors:', errors)
          }

        } catch (error) {
          console.error('❌ Upload process failed:', error)
          
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred during upload'
          }) + '\n'))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('❌ API endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start upload process',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}