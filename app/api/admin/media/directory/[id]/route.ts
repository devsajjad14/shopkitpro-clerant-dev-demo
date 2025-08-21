import { NextResponse } from 'next/server'
import { UPLOAD_FOLDERS } from '@/app/admin/media/upload-media/config'
import { getPlatformDirectoryInfo } from '@/lib/services/platform-upload-service'

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

    console.log('🔍 [DIRECTORY-API] Getting platform directory info...')
    // Use platform-aware directory info retrieval
    const directoryInfo = await getPlatformDirectoryInfo(directoryId, folder)
    console.log('🔍 [DIRECTORY-API] Directory info retrieved:', {
      id: directoryInfo.id,
      fileCount: directoryInfo.fileCount,
      totalSize: directoryInfo.totalSize
    })

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