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
  { params }: { params: Promise<{ directoryId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const { directoryId } = await params
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
    
    console.log('🔍 Files API - Platform:', effectivePlatform, 'for directory:', directoryId)

    if (effectivePlatform === 'vercel') {
      // VERCEL MODE: Use blob storage
      console.log('☁️  Using Vercel blob storage')
      const { blobs } = await list({ prefix: `${folderPath}/` })

      const files = blobs.map(blob => {
        const filename = blob.pathname.split('/').pop() || ''
        const extension = filename.split('.').pop()?.toLowerCase() || ''
        
        return {
          name: filename,
          size: blob.size,
          type: extension,
          lastModified: blob.uploadedAt.toISOString(),
          url: blob.downloadUrl || blob.url,
          isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif', 'jxl', 'jp2', 'jpx', 'j2k', 'j2c'].includes(extension)
        }
      })

      console.log('☁️  Loaded', files.length, 'files from Vercel storage')
      return NextResponse.json(files, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      })
      
    } else {
      // SERVER MODE: Use filesystem from client/media/[directory]
      console.log('🖥️  Using server filesystem')
      const fullPath = join(process.cwd(), 'media', directoryId)
      
      console.log('🖥️  Checking path:', fullPath)
      
      if (!existsSync(fullPath)) {
        console.log('📁 Directory does not exist, returning empty array')
        return NextResponse.json([], {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          }
        })
      }

      const fileNames = await readdir(fullPath)
      console.log('📂 Found', fileNames.length, 'files in directory:', fileNames)
      
      const files = await Promise.allSettled(
        fileNames.map(async fileName => {
          const filePath = join(fullPath, fileName)
          console.log('📄 Processing file:', fileName, 'at path:', filePath)
          
          try {
            const stats = await stat(filePath)
            const extension = fileName.split('.').pop()?.toLowerCase() || ''
            
            const fileInfo = {
              name: fileName,
              size: stats.size,
              type: extension,
              lastModified: stats.mtime.toISOString(),
              url: `/media/${directoryId}/${fileName}`,
              isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif', 'jxl', 'jp2', 'jpx', 'j2k', 'j2c'].includes(extension)
            }
            
            console.log('✅ File processed successfully:', fileName, fileInfo)
            return fileInfo
          } catch (error) {
            console.error('❌ Error processing file:', fileName, error)
            throw error
          }
        })
      )

      const validFiles = files
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)

      console.log('🖥️  Loaded', validFiles.length, 'files from server filesystem')
      return NextResponse.json(validFiles, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      })
    }

  } catch (error) {
    console.error('❌ Files API error:', error)
    return NextResponse.json(
      { error: 'Failed to get directory files' },
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