import { NextResponse } from 'next/server'
import { UPLOAD_FOLDERS } from '@/app/admin/media/upload-media/config'
import { list } from '@vercel/blob'
import { getSettings } from '@/lib/actions/settings'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [DIRECTORY-API] Starting request, params:', params)
    console.log('🔍 [DIRECTORY-API] Available folders:', UPLOAD_FOLDERS.map(f => f.id))
    
    const directoryId = params.id
    console.log('🔍 [DIRECTORY-API] Request for directory:', directoryId)
    
    if (!directoryId) {
      console.error('🔍 [DIRECTORY-API] Missing directory ID')
      return NextResponse.json(
        { error: 'Directory ID is required' },
        { status: 400 }
      )
    }
    
    // Find the folder configuration
    const folder = UPLOAD_FOLDERS.find(f => f.id === directoryId)
    console.log('🔍 [DIRECTORY-API] Folder found:', folder?.name || 'NOT FOUND')
    
    if (!folder) {
      console.error('🔍 [DIRECTORY-API] Folder not found for ID:', directoryId)
      return NextResponse.json(
        { error: `Directory not found: ${directoryId}` },
        { status: 404 }
      )
    }

    console.log('🔍 [DIRECTORY-API] Getting directory info...')
    
    // Simple platform detection
    let platform = 'server'
    try {
      const settings = await getSettings('general')
      platform = settings?.platform === 'vercel' ? 'vercel' : 'server'
    } catch (err) {
      // Fallback to environment check
      if (process.env.VERCEL || process.env.VERCEL_ENV) {
        platform = 'vercel'
      }
    }
    
    console.log('🔍 [DIRECTORY-API] Platform:', platform)
    
    // Get file count based on platform
    let fileCount = 0
    if (platform === 'vercel') {
      try {
        const { blobs } = await list({ 
          prefix: `${folder.path}/`,
          limit: 1000 // Just get count, not all files
        })
        fileCount = blobs.length
        console.log('🔍 [DIRECTORY-API] Vercel file count:', fileCount)
      } catch (error) {
        console.error('🔍 [DIRECTORY-API] Vercel list error:', error)
        fileCount = 0
      }
    }
    
    const directoryInfo = {
      id: folder.id,
      name: folder.name,
      path: folder.path,
      description: folder.description,
      icon: folder.icon,
      fileCount,
      totalSize: 0,
      lastModified: new Date()
    }
    
    console.log('🔍 [DIRECTORY-API] Returning:', directoryInfo)
    return NextResponse.json(directoryInfo)
  } catch (error) {
    console.error('🔍 [DIRECTORY-API] Error getting directory info:', error)
    console.error('🔍 [DIRECTORY-API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      directoryId: params.id
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to get directory information',
        details: error instanceof Error ? error.message : 'Unknown error',
        directoryId: params.id
      },
      { status: 500 }
    )
  }
}