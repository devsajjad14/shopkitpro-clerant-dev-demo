import { NextRequest, NextResponse } from 'next/server'

// Dynamic import for Vercel upload operations
const importVercelUploadService = () => import('@/lib/media/vercel-upload-service')
const importPath = () => import('path')

export async function POST(req: NextRequest) {
  try {
    const { processLocalMediaFiles } = await importVercelUploadService()
    const path = await importPath()
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN not configured'
      }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'general'
    
    console.log(`🔄 Starting Vercel upload for category: ${category}`)

    // Map category to local media path
    const categoryPaths: Record<string, string> = {
      'products': 'media/products',
      'main-banners': 'media/main-banners', 
      'mini-banners': 'media/mini-banners',
      'brands': 'media/brands',
      'site': 'media/site',
      'users': 'media/users',
      'pages': 'media/pages',
      'general': 'media'
    }

    const localPath = categoryPaths[category] || 'media'
    const mediaPath = path.join(process.cwd(), localPath)
    
    // Map to Vercel folder structure
    const vercelFolders: Record<string, string> = {
      'products': 'products',
      'main-banners': 'main-banners',
      'mini-banners': 'mini-banners', 
      'brands': 'brands',
      'site': 'site',
      'users': 'users',
      'pages': 'pages',
      'general': 'general'
    }

    const vercelFolder = vercelFolders[category] || 'general'

    console.log(`📁 Processing files from: ${mediaPath}`)
    console.log(`☁️ Uploading to Vercel folder: ${vercelFolder}`)

    const results = await processLocalMediaFiles(mediaPath, vercelFolder)

    const summary = {
      totalProcessed: results.uploaded.length + results.skipped.length + results.errors.length,
      uploaded: results.uploaded.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      totalSize: results.uploaded.reduce((acc, file) => acc + file.size, 0)
    }

    console.log(`✅ Upload complete - ${summary.uploaded} uploaded, ${summary.skipped} skipped, ${summary.errors} errors`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${summary.totalProcessed} files`,
      category,
      summary,
      results: {
        uploaded: results.uploaded,
        skipped: results.skipped,
        errors: results.errors
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Vercel upload error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to upload files to Vercel',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}