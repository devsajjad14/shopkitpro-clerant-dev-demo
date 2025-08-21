import { NextResponse } from 'next/server'
import { UPLOAD_FOLDERS } from '@/app/admin/media/upload-media/config'
import { getPlatformDirectoryInfo } from '@/lib/services/platform-upload-service'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const directoryId = params.id
    
    // Find the folder configuration
    const folder = UPLOAD_FOLDERS.find(f => f.id === directoryId)
    if (!folder) {
      return NextResponse.json(
        { error: 'Directory not found' },
        { status: 404 }
      )
    }

    // Use platform-aware directory info retrieval
    const directoryInfo = await getPlatformDirectoryInfo(directoryId, folder)

    return NextResponse.json(directoryInfo)
  } catch (error) {
    console.error('Error getting directory info:', error)
    return NextResponse.json(
      { error: 'Failed to get directory information' },
      { status: 500 }
    )
  }
}