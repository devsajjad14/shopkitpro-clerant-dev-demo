import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

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
          
          // Filter out system files and unwanted directories
          const mediaFiles = allFiles.filter(file => {
            const relativePath = path.relative(mediaDir, file)
            return !relativePath.startsWith('.') && 
                   !relativePath.includes('/.') &&
                   !relativePath.toLowerCase().includes('thumbs.db') &&
                   !relativePath.toLowerCase().includes('.ds_store')
          })

          console.log(`📊 Found ${mediaFiles.length} files to upload`)

          // Check existing files on Vercel Blob
          console.log('🔍 Checking existing files on Vercel Blob...')
          console.log('📊 BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN)
          const { blobs } = await list({
            token: process.env.BLOB_READ_WRITE_TOKEN
          })
          
          // Create a Set of existing file paths for quick lookup
          const existingFiles = new Set(blobs.map(blob => blob.pathname))
          console.log(`📊 Found ${existingFiles.size} existing files on Vercel Blob`)

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
              vercelFiles: existingFiles.size,
              toUpload: mediaFiles.length,
              toDownload: 0
            }
          }) + '\n'))

          let uploadedCount = 0
          let skippedCount = 0
          let processedCount = 0
          const errors: string[] = []

          // Upload each file
          for (const filePath of mediaFiles) {
            try {
              processedCount++
              const relativePath = path.relative(mediaDir, filePath)
              const fileName = relativePath.replace(/\\/g, '/') // Ensure forward slashes for web
              
              console.log(`⬆️ Processing: ${relativePath} (${processedCount}/${mediaFiles.length})`)
              
              // Check if file already exists on Vercel Blob
              if (existingFiles.has(fileName)) {
                skippedCount++
                console.log(`⏭️ Skipped: ${relativePath} (already exists on Vercel Blob)`)
                
                // Send progress update for skipped file
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'progress',
                  current: processedCount,
                  total: mediaFiles.length,
                  currentFile: relativePath,
                  uploaded: uploadedCount,
                  skipped: skippedCount,
                  action: 'skipped',
                  reason: 'already exists on Vercel Blob',
                  phase: 'uploading'
                }) + '\n'))
                
                continue
              }
              
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

              // Read file
              const fileBuffer = fs.readFileSync(filePath)

              // Upload to Vercel Blob
              const blob = await put(fileName, fileBuffer, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN
              })

              uploadedCount++
              console.log(`✅ Uploaded: ${relativePath} -> ${blob.url} (${uploadedCount} uploaded, ${skippedCount} skipped)`)

            } catch (error) {
              const relativePath = path.relative(mediaDir, filePath)
              console.error(`❌ Error uploading ${relativePath}:`, error)
              errors.push(`${relativePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
              // Continue with next file instead of stopping
            }
          }

          // Send completion
          const successMessage = `Uploaded ${uploadedCount} files, skipped ${skippedCount} existing files`
          const errorMessage = errors.length > 0 ? `, ${errors.length} files failed to upload` : ''
          
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'complete',
            totalFiles: uploadedCount,
            skippedFiles: skippedCount,
            processedFiles: processedCount,
            message: successMessage + errorMessage,
            errors: errors
          }) + '\n'))

          console.log(`🎉 Upload complete! ${uploadedCount} files uploaded, ${skippedCount} files skipped, ${errors.length} errors`)

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