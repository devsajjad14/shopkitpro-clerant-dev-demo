import { NextRequest, NextResponse } from 'next/server'

const importDemoUploadService = () => import('@/lib/demo/demo-upload-service')

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Vercel Blob storage not configured'
      }, { status: 400 })
    }
    
    const { processMediaUpload } = await importDemoUploadService()
    const results = await processMediaUpload(category || undefined)
    
    return NextResponse.json({
      success: true,
      message: `Upload completed: ${results.uploaded.length} uploaded, ${results.errors.length} errors`,
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}