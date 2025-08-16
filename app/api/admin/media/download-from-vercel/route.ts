import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting Vercel Blob media download...')

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // List all files in Vercel Blob
          console.log('📋 Listing files from Vercel Blob...')
          
          const { blobs } = await list({
            token: process.env.BLOB_READ_WRITE_TOKEN
          })

          // Filter out Data-Db folder
          const filteredBlobs = blobs.filter(blob => 
            !blob.pathname.startsWith('Data-Db/') && 
            !blob.pathname.startsWith('data-db/') &&
            blob.pathname.toLowerCase() !== 'data-db' &&
            !blob.pathname.toLowerCase().startsWith('data-db/')
          )

          console.log(`📊 Found ${blobs.length} total files, ${filteredBlobs.length} files after excluding Data-Db folder`)

          // Send initial progress
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'progress',
            current: 0,
            total: filteredBlobs.length,
            currentFile: null
          }) + '\n'))

          const mediaDir = path.join(process.cwd(), 'media')
          
          // Ensure media directory exists
          if (!fs.existsSync(mediaDir)) {
            fs.mkdirSync(mediaDir, { recursive: true })
            console.log('📁 Created media directory')
          }

          let downloadedCount = 0
          let skippedCount = 0
          let processedCount = 0

          // Download each file
          for (const blob of filteredBlobs) {
            try {
              processedCount++
              console.log(`⬇️ Processing: ${blob.pathname} (${processedCount}/${filteredBlobs.length})`)
              
              // Check if file already exists locally
              const filePath = path.join(mediaDir, blob.pathname)
              
              if (fs.existsSync(filePath)) {
                skippedCount++
                console.log(`⏭️ Skipped: ${blob.pathname} (already exists locally)`)
                
                // Send progress update for skipped file
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'progress',
                  current: processedCount,
                  total: filteredBlobs.length,
                  currentFile: blob.pathname,
                  downloaded: downloadedCount,
                  skipped: skippedCount,
                  action: 'skipped',
                  reason: 'already exists locally'
                }) + '\n'))
                
                continue
              }
              
              // Send progress update for downloading
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'progress',
                current: processedCount,
                total: filteredBlobs.length,
                currentFile: blob.pathname,
                downloaded: downloadedCount,
                skipped: skippedCount,
                action: 'downloading'
              }) + '\n'))

              // Download file from Vercel Blob
              const response = await fetch(blob.url)
              if (!response.ok) {
                console.error(`❌ Failed to download ${blob.pathname}: ${response.status}`)
                continue
              }

              // Create directory structure
              const fileDir = path.dirname(filePath)
              
              if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true })
                console.log(`📁 Created directory: ${fileDir}`)
              }

              // Save file
              const buffer = Buffer.from(await response.arrayBuffer())
              fs.writeFileSync(filePath, buffer)
              
              downloadedCount++
              console.log(`✅ Downloaded: ${blob.pathname} (${downloadedCount} downloaded, ${skippedCount} skipped)`)

            } catch (error) {
              console.error(`❌ Error processing ${blob.pathname}:`, error)
              // Continue with next file instead of stopping
            }
          }

          // Send completion
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'complete',
            totalFiles: downloadedCount,
            skippedFiles: skippedCount,
            processedFiles: processedCount,
            message: `Downloaded ${downloadedCount} files, skipped ${skippedCount} existing files`
          }) + '\n'))

          console.log(`🎉 Download complete! ${downloadedCount} files downloaded, ${skippedCount} files skipped`)

        } catch (error) {
          console.error('❌ Download process failed:', error)
          
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
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
        error: 'Failed to start download process',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}