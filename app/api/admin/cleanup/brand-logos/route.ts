import { NextResponse } from 'next/server'
import { cleanupOrphanedBrandLogos } from '@/lib/services/file-cleanup-service'

/**
 * Admin API endpoint for cleaning up orphaned brand logo files
 * Industry best practice: Provide admin tools for system maintenance
 */
export async function POST() {
  try {
    console.log('Starting orphaned brand logos cleanup...')
    
    const result = await cleanupOrphanedBrandLogos()
    
    if (result.success) {
      console.log('Orphaned brand logos cleanup completed successfully')
      return NextResponse.json({
        success: true,
        message: 'Brand logos cleanup completed',
        stats: {
          deletedCount: result.deletedCount,
          failedCount: result.failedCount,
          errors: result.errors
        }
      })
    } else {
      console.error('Orphaned brand logos cleanup failed:', result.errors)
      return NextResponse.json({
        success: false,
        error: 'Cleanup operation failed',
        details: result.errors
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error in brand logos cleanup API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get cleanup status and statistics
 */
export async function GET() {
  try {
    // This could be expanded to show cleanup statistics, last cleanup time, etc.
    return NextResponse.json({
      success: true,
      message: 'Brand logos cleanup endpoint is available',
      endpoints: {
        cleanup: 'POST /api/admin/cleanup/brand-logos - Run cleanup operation',
        status: 'GET /api/admin/cleanup/brand-logos - Get cleanup status'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get cleanup status'
    }, { status: 500 })
  }
}