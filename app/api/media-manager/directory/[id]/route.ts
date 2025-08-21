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
  { params }: { params: { id: string } }
) {
  try {
    const directoryId = params.id
    const folderPath = FOLDER_MAPPING[directoryId as keyof typeof FOLDER_MAPPING]
    
    if (!folderPath) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      )
    }

    // Use the exact pattern you specified
    const { blobs } = await list({ prefix: `${folderPath}/` });

    // Return directory info with file count from blob response
    return NextResponse.json({
      id: directoryId,
      name: folderPath,
      path: folderPath,
      fileCount: blobs.length,
      totalSize: blobs.reduce((sum, blob) => sum + blob.size, 0),
      lastModified: new Date(),
      // Include the blob data for file listings
      blobs: blobs
    })

  } catch (error) {
    console.error('Directory API error:', error)
    return NextResponse.json(
      { error: 'Failed to get directory information' },
      { status: 500 }
    )
  }
}