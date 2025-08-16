import { NextResponse } from 'next/server'
import { deleteAsset } from '@/lib/services/platform-upload-service'

/**
 * DELETE /api/admin/media/delete
 * Professional media file deletion endpoint
 * Handles both server and Vercel platform file deletion
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('url')
    
    console.log('🗑️  DELETE request received for media file:', fileUrl)
    
    if (!fileUrl) {
      console.error('❌ No file URL provided for deletion')
      return NextResponse.json({
        success: false,
        error: 'No file URL provided'
      }, { status: 400 })
    }

    console.log('🔄 Attempting to delete media file:', fileUrl)
    
    // Use platform-aware delete service
    const deleteSuccess = await deleteAsset(fileUrl)
    
    if (deleteSuccess) {
      console.log('✅ Media file deleted successfully:', fileUrl)
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
        deletedUrl: fileUrl,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error('❌ Failed to delete media file:', fileUrl)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete file from storage'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Media file deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during file deletion',
      details: 'Check server logs for more information'
    }, { status: 500 })
  }
}

// Health check for delete service
export async function GET() {
  return NextResponse.json({
    service: 'Media File Deletion Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supportedPlatforms: ['server', 'vercel'],
    description: 'Platform-aware file deletion with automatic cleanup'
  })
}