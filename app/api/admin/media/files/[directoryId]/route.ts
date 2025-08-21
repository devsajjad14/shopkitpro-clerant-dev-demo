import { NextResponse } from 'next/server'
import { UPLOAD_FOLDERS } from '@/app/admin/media/upload-media/config'
import { listPlatformFiles } from '@/lib/services/platform-upload-service'

export async function GET(
  request: Request,
  { params }: { params: { directoryId: string } }
) {
  try {
    const directoryId = params.directoryId
    
    // Find the folder configuration
    const folder = UPLOAD_FOLDERS.find(f => f.id === directoryId)
    if (!folder) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      )
    }

    // Use platform-aware file listing
    const files = await listPlatformFiles(folder.path)

    return NextResponse.json(files)
  } catch (error) {
    console.error('Error getting directory files:', error)
    return NextResponse.json(
      { error: 'Failed to get directory files' },
      { status: 500 }
    )
  }
}