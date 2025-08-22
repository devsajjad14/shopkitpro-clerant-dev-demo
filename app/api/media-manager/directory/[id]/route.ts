import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const FOLDER_MAPPING = {
  'products': 'products',
  'brands': 'brands', 
  'site': 'site',
  'users': 'users',
  'main-banners': 'main-banners',
  'mini-banners': 'mini-banners',
  'pages': 'pages'
} as const

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const { id: directoryId } = await params
    const folderPath = FOLDER_MAPPING[directoryId as keyof typeof FOLDER_MAPPING]
    
    if (!folderPath) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        }
      )
    }

    // Get platform from query parameter - user's choice overrides auto-detection
    const requestedPlatform = searchParams.get('platform')
    const effectivePlatform = requestedPlatform === 'server' ? 'server' : 'vercel'
    
    console.log('🔍 Directory API - Platform:', effectivePlatform, 'for directory:', directoryId)

    if (effectivePlatform === 'vercel') {
      // VERCEL MODE: Use blob storage
      console.log('☁️  Using Vercel blob storage for directory info')
      const { blobs } = await list({ prefix: `${folderPath}/` })

      return NextResponse.json({
        id: directoryId,
        name: folderPath,
        path: folderPath,
        fileCount: blobs.length,
        totalSize: blobs.reduce((sum, blob) => sum + blob.size, 0),
        lastModified: new Date(),
        platform: 'vercel',
        blobs: blobs
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      })
      
    } else {
      // SERVER MODE: Use filesystem from client/media/[directory]
      console.log('🖥️  Using server filesystem for directory info')
      const fullPath = join(process.cwd(), 'media', directoryId)
      
      console.log('🖥️  Checking directory path:', fullPath)
      
      if (!existsSync(fullPath)) {
        console.log('📁 Directory does not exist, creating empty response')
        return NextResponse.json({
          id: directoryId,
          name: folderPath,
          path: directoryId,
          fileCount: 0,
          totalSize: 0,
          lastModified: new Date(),
          platform: 'server'
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        })
      }

      const files = await readdir(fullPath)
      console.log('📂 Found', files.length, 'files in directory')
      
      const fileStats = await Promise.allSettled(
        files.map(async file => {
          const filePath = join(fullPath, file)
          const stats = await stat(filePath)
          return {
            name: file,
            size: stats.size,
            lastModified: stats.mtime
          }
        })
      )

      const validFiles = fileStats
        .filter((result): result is PromiseFulfilledResult<{name: string, size: number, lastModified: Date}> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)

      console.log('🖥️  Processed', validFiles.length, 'files from server filesystem')
      
      return NextResponse.json({
        id: directoryId,
        name: folderPath,
        path: directoryId,
        fileCount: validFiles.length,
        totalSize: validFiles.reduce((sum, file) => sum + file.size, 0),
        lastModified: new Date(),
        platform: 'server'
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      })
    }

  } catch (error) {
    console.error('❌ Directory API error:', error)
    return NextResponse.json(
      { error: 'Failed to get directory information' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    )
  }
}