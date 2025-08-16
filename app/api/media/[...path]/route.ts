import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Await params as required by Next.js
    const { path } = await params
    
    // Construct file path
    const filePath = join(process.cwd(), 'media', ...path)
    
    // Security check: ensure path is within media directory
    const mediaDir = join(process.cwd(), 'media')
    if (!filePath.startsWith(mediaDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
    }
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Determine content type
    const extension = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
    }
    
    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('Error serving media file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}