import { NextResponse } from 'next/server'
import { deleteAsset } from '@/lib/services/platform-upload-service'

/**
 * Debug endpoint to test Vercel blob deletion
 * Usage: POST /api/debug/test-vercel-delete with { "url": "https://example.blob.vercel-storage.com/..." }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({
        error: 'URL is required'
      }, { status: 400 })
    }

    console.log('[DEBUG] Testing Vercel blob deletion for URL:', url)
    console.log('[DEBUG] BLOB_READ_WRITE_TOKEN available:', !!process.env.BLOB_READ_WRITE_TOKEN)
    
    const result = await deleteAsset(url)
    
    return NextResponse.json({
      success: true,
      deleted: result,
      url: url,
      tokenAvailable: !!process.env.BLOB_READ_WRITE_TOKEN
    })

  } catch (error) {
    console.error('[DEBUG] Test deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tokenAvailable: !!process.env.BLOB_READ_WRITE_TOKEN
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Vercel delete test endpoint',
    usage: 'POST with { "url": "https://example.blob.vercel-storage.com/..." }',
    tokenConfigured: !!process.env.BLOB_READ_WRITE_TOKEN
  })
}