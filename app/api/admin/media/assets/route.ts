import { NextResponse } from 'next/server'

// Dynamic imports for media scanning
const importServerScanner = () => import('@/lib/media/server-scanner')
const importVercelScanner = () => import('@/lib/media/vercel-scanner')
const importAssetUtils = () => import('@/lib/media/asset-utils')
const importDeploymentDetection = () => import('@/lib/utils/server-deployment-detection')

interface MediaAsset {
  id: string
  filename: string
  url: string
  type: string
  size: number
  category: string
  uploadedAt: Date
}

/**
 * GET /api/admin/media/assets
 * Enterprise-optimized media asset discovery with pagination and streaming
 * Query params:
 * - platform: 'vercel' | 'server' | auto-detect
 * - page: number (default: 1) 
 * - limit: number (default: 0 for unlimited, any positive number for pagination)
 * - category: string (optional filter)
 * - search: string (optional filename search)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters - support unlimited files
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const requestedLimit = parseInt(searchParams.get('limit') || '0')
    // If limit is 0 or very high, return ALL files (unlimited support)
    const limit = requestedLimit === 0 || requestedLimit > 50000 ? Number.MAX_SAFE_INTEGER : Math.max(10, requestedLimit)
    const offset = limit === Number.MAX_SAFE_INTEGER ? 0 : (page - 1) * limit
    
    // Filter parameters
    const categoryFilter = searchParams.get('category')
    const searchFilter = searchParams.get('search')?.toLowerCase()
    const requestedPlatform = searchParams.get('platform')
    
    console.log(`🔍 Starting paginated asset discovery (page: ${page}, limit: ${limit})`)
    
    // Detect platform
    const { detectServerDeploymentEnvironment } = await importDeploymentDetection()
    const deploymentEnv = await detectServerDeploymentEnvironment().catch(() => ({ platform: 'server' as const }))
    const effectivePlatform = requestedPlatform === 'vercel' ? 'vercel' : 
                            requestedPlatform === 'server' ? 'server' : 
                            deploymentEnv.platform
    
    console.log('📡 Detected platform:', deploymentEnv.platform)
    console.log('🔄 Requested platform:', requestedPlatform)
    console.log('✅ Effective platform:', effectivePlatform)
    
    if (effectivePlatform === 'vercel') {
      console.log('☁️  Vercel platform detected - scanning blob storage')
      
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.log('❌ BLOB_READ_WRITE_TOKEN not configured')
        return NextResponse.json({
          success: true,
          assets: [],
          platform: effectivePlatform,
          stats: { totalAssets: 0, totalSize: 0, categories: {}, types: {} },
          message: 'Vercel blob token not configured. Check environment variables.',
          timestamp: new Date().toISOString()
        })
      }

      try {
        const { scanVercelBlobStorage } = await importVercelScanner()
        const { applyAssetFilters, sortAssetsByDate, paginateAssets, calculateAssetStats } = await importAssetUtils()
        
        const assets = await scanVercelBlobStorage(categoryFilter)
        
        const filteredAssets = applyAssetFilters(assets, categoryFilter, searchFilter)
        const sortedAssets = sortAssetsByDate(filteredAssets)
        const { paginatedAssets, totalAssets, pagination } = paginateAssets(sortedAssets, page, limit)
        const { stats, filteredStats } = calculateAssetStats(assets, sortedAssets)
        
        console.log(`✅ Vercel blob discovery completed: ${totalAssets} total, ${paginatedAssets.length} on page ${page}`)
        
        return NextResponse.json({
          success: true,
          assets: paginatedAssets,
          pagination,
          stats: filteredStats,
          platform: effectivePlatform,
          filters: { category: categoryFilter, search: searchFilter },
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        console.error('❌ Vercel blob discovery error:', error)
        return NextResponse.json({
          success: true,
          assets: [],
          platform: effectivePlatform,
          stats: { totalAssets: 0, totalSize: 0, categories: {}, types: {} },
          error: 'Failed to discover Vercel blob assets',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        })
      }
    }

    console.log('🖥️  Server platform detected - scanning local media directories')
    
    try {
      const { scanServerMediaDirectories } = await importServerScanner()
      const { applyAssetFilters, sortAssetsByDate, paginateAssets, calculateAssetStats } = await importAssetUtils()
      
      const assets = await scanServerMediaDirectories(categoryFilter, searchFilter)
      
      if (assets.length === 0) {
        return NextResponse.json({
          success: true,
          assets: [],
          platform: effectivePlatform,
          stats: { totalAssets: 0, totalSize: 0, categories: {}, types: {} },
          message: 'Media directory not found. Upload files to create the directory structure.',
          timestamp: new Date().toISOString()
        })
      }
      
      const filteredAssets = applyAssetFilters(assets, categoryFilter, searchFilter)
      const sortedAssets = sortAssetsByDate(filteredAssets)
      const { paginatedAssets, totalAssets, pagination } = paginateAssets(sortedAssets, page, limit)
      const { stats, filteredStats } = calculateAssetStats(assets, sortedAssets)
      
      console.log(`✅ Asset discovery completed: ${totalAssets} total, ${paginatedAssets.length} on page ${page}`)
      
      return NextResponse.json({
        success: true,
        assets: paginatedAssets,
        pagination,
        stats: filteredStats,
        platform: effectivePlatform,
        filters: { category: categoryFilter, search: searchFilter },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Server media scanning error:', error)
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        platform: effectivePlatform
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Media asset discovery error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Failed to discover media assets. Check server logs for more information.'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/media/assets
 * Professional bulk asset deletion endpoint
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assetIds = searchParams.get('ids')?.split(',') || []
    
    if (!assetIds.length) {
      return NextResponse.json({
        success: false,
        error: 'No asset IDs provided for deletion'
      }, { status: 400 })
    }

    console.log(`🗑️  Starting bulk deletion of ${assetIds.length} assets`)

    // TODO: Implement asset deletion logic
    // This would require parsing the asset IDs to determine file paths
    // and using the platform-aware delete service

    return NextResponse.json({
      success: false,
      error: 'Bulk deletion not yet implemented',
      message: 'Use individual file deletion for now'
    }, { status: 501 })

  } catch (error) {
    console.error('❌ Bulk deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}