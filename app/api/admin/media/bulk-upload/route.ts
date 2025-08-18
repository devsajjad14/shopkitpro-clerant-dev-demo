import { NextResponse } from 'next/server'
import { uploadMediaFiles, type MediaCategory } from '@/lib/services/media-upload-service'

// Media category mapping (preserves original filenames)
const VALID_CATEGORIES: MediaCategory[] = [
  'products', 'main-banners', 'mini-banners', 'brands', 'site', 'users', 'pages'
]

interface UploadResult {
  fileId: string
  filename: string
  category: string
  success: boolean
  url?: string
  error?: string
  size?: number
}

export async function POST(request: Request) {
  try {
    // Get platform from query parameter (admin switcher setting)
    const { searchParams } = new URL(request.url)
    const requestedPlatform = searchParams.get('platform') as 'server' | 'vercel' | null
    
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const categories = formData.getAll('categories') as string[]
    const fileIds = formData.getAll('fileIds') as string[]
    const isReplacement = formData.get('isReplacement') === 'true'

    console.log('📤 Bulk upload request - Platform:', requestedPlatform, '- Replacement:', isReplacement)

    if (!files.length || !categories.length || !fileIds.length) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: files, categories, and fileIds are required'
      }, { status: 400 })
    }

    if (files.length !== categories.length || files.length !== fileIds.length) {
      return NextResponse.json({
        success: false,
        error: 'Files, categories, and fileIds arrays must have the same length'
      }, { status: 400 })
    }

    console.log(`🚀 Starting bulk media upload of ${files.length} files (preserving original filenames)`)

    // Validate categories
    for (const category of categories) {
      if (!VALID_CATEGORIES.includes(category as MediaCategory)) {
        return NextResponse.json({
          success: false,
          error: `Invalid category: ${category}. Valid categories: ${VALID_CATEGORIES.join(', ')}`
        }, { status: 400 })
      }
    }

    // Prepare files for batch upload
    const fileUploadRequests = files.map((file, index) => ({
      file,
      category: categories[index] as MediaCategory
    }))

    // Upload using media service that preserves filenames
    const uploadResults = await uploadMediaFiles(fileUploadRequests, requestedPlatform, isReplacement)

    // Convert results to expected format
    const results: UploadResult[] = uploadResults.map((result, index) => ({
      fileId: fileIds[index],
      filename: result.originalFilename,
      category: categories[index],
      success: result.success,
      url: result.url,
      size: files[index].size,
      error: result.error,
      replaced: result.replaced
    }))

    // Calculate statistics
    const stats = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalSize: results.reduce((acc, r) => acc + (r.size || 0), 0)
    }

    console.log(`🎉 Bulk upload completed:`, stats)

    return NextResponse.json({
      success: true,
      results,
      stats,
      platform: requestedPlatform,
      message: `Upload completed: ${stats.successful}/${stats.total} files uploaded successfully`
    })

  } catch (error) {
    console.error('❌ Bulk upload error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during bulk upload',
      details: 'Check server logs for more information'
    }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    service: 'Media Bulk Upload Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supportedCategories: VALID_CATEGORIES,
    maxFileSize: 'unlimited',
    batchSize: 'unlimited'
  })
}