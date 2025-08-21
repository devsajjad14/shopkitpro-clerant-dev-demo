import { NextResponse } from 'next/server'
import { UPLOAD_FOLDERS } from '@/app/admin/media/upload-media/config'
import { list } from '@vercel/blob'
import { getSettings } from '@/lib/actions/settings'

export async function GET(
  request: Request,
  { params }: { params: { directoryId: string } }
) {
  try {
    const directoryId = params.directoryId
    console.log('🔍 [FILES-API] Request for directory:', directoryId)
    
    // Find the folder configuration
    const folder = UPLOAD_FOLDERS.find(f => f.id === directoryId)
    if (!folder) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      )
    }

    console.log('🔍 [FILES-API] Folder found:', folder.name, 'path:', folder.path)

    // Simple platform detection (same as working assets API)
    let platform = 'server'
    try {
      const settings = await getSettings('general')
      platform = settings?.platform === 'vercel' ? 'vercel' : 'server'
    } catch (err) {
      if (process.env.VERCEL || process.env.VERCEL_ENV) {
        platform = 'vercel'
      }
    }
    
    console.log('🔍 [FILES-API] Platform:', platform)
    
    if (platform === 'vercel') {
      try {
        // Use same approach as working assets API
        console.log('🔍 [FILES-API] Getting Vercel blobs with prefix:', `${folder.path}/`)
        const { blobs } = await list({ 
          prefix: `${folder.path}/`  // Simple prefix like "products/"
        })
        
        console.log('🔍 [FILES-API] Found', blobs.length, 'blobs')
        
        // Convert blobs to file format
        const files = blobs.map(blob => {
          const filename = blob.pathname.split('/').pop() || ''
          const extension = filename.split('.').pop()?.toLowerCase() || ''
          
          return {
            name: filename,
            size: blob.size,
            type: extension,
            lastModified: blob.uploadedAt.toISOString(),
            url: blob.url,
            isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp'].includes(extension)
          }
        })
        
        console.log('🔍 [FILES-API] Returning', files.length, 'files')
        return NextResponse.json(files)
        
      } catch (vercelError) {
        console.error('🔍 [FILES-API] Vercel error:', vercelError)
        return NextResponse.json([])
      }
    }
    
    // Server platform would go here (not needed for this issue)
    console.log('🔍 [FILES-API] Server platform - returning empty for now')
    return NextResponse.json([])

  } catch (error) {
    console.error('🔍 [FILES-API] Error getting directory files:', error)
    return NextResponse.json(
      { error: 'Failed to get directory files' },
      { status: 500 }
    )
  }
}