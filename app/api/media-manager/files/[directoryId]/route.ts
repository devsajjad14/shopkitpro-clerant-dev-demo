import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

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
  { params }: { params: { directoryId: string } }
) {
  try {
    const directoryId = params.directoryId
    const folderPath = FOLDER_MAPPING[directoryId as keyof typeof FOLDER_MAPPING]
    
    if (!folderPath) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      )
    }

    // Use the exact pattern you specified
    const { blobs } = await list({ prefix: `${folderPath}/` });

    // Convert blobs to file format expected by frontend
    const files = blobs.map(blob => {
      const filename = blob.pathname.split('/').pop() || ''
      const extension = filename.split('.').pop()?.toLowerCase() || ''
      
      return {
        name: filename,
        size: blob.size,
        type: extension,
        lastModified: blob.uploadedAt.toISOString(),
        url: blob.downloadUrl || blob.url, // Use downloadUrl as recommended
        isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp'].includes(extension)
      }
    })

    return NextResponse.json(files)

  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json(
      { error: 'Failed to get directory files' },
      { status: 500 }
    )
  }
}