import { NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { list } from '@vercel/blob'

// Dynamic import for server detection
const getServerDeploymentEnvironment = async () => {
  try {
    const { detectServerDeploymentEnvironment } = await import('@/lib/utils/server-deployment-detection')
    return detectServerDeploymentEnvironment()
  } catch {
    return { platform: 'server' as const }
  }
}

interface MediaAsset {
  id: string
  filename: string
  url: string
  type: string
  size: number
  category: string
  uploadedAt: Date
}

// Professional media directories mapping
const MEDIA_DIRECTORIES = {
  'products': 'media/products',
  'main-banners': 'media/main-banners',
  'mini-banners': 'media/mini-banners',
  'brands': 'media/brands',
  'site': 'media/site',
  'users': 'media/users',
  'pages': 'media/pages',
} as const

// Vercel blob folder mapping
const VERCEL_FOLDERS = {
  'products': 'products',
  'main-banners': 'main-banners',
  'mini-banners': 'mini-banners',
  'brands': 'brands',
  'site': 'site',
  'users': 'users',
  'pages': 'pages',
} as const

// Comprehensive image and media extensions
const MEDIA_EXTENSIONS = [
  // Common image formats
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  // Modern image formats
  '.avif', '.heic', '.heif', '.bmp', '.tiff', '.tif',
  // Case variations
  '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP', '.SVG',
  '.AVIF', '.HEIC', '.HEIF', '.BMP', '.TIFF', '.TIF',
  // Other media files that might be in media folders
  '.ico', '.ICO'
] as const

/**
 * GET /api/admin/media/assets
 * Enterprise-optimized media asset discovery with pagination and streaming
 * Query params:
 * - platform: 'vercel' | 'server' | auto-detect
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 * - category: string (optional filter)
 * - search: string (optional filename search)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
    const offset = (page - 1) * limit
    
    // Filter parameters
    const categoryFilter = searchParams.get('category')
    const searchFilter = searchParams.get('search')?.toLowerCase()
    const requestedPlatform = searchParams.get('platform')
    
    console.log(`🔍 Starting paginated asset discovery (page: ${page}, limit: ${limit})`)
    
    // Detect platform
    const deploymentEnv = await getServerDeploymentEnvironment()
    const effectivePlatform = requestedPlatform === 'vercel' ? 'vercel' : 
                            requestedPlatform === 'server' ? 'server' : 
                            deploymentEnv.platform
    
    console.log('📡 Detected platform:', deploymentEnv.platform)
    console.log('🔄 Requested platform:', requestedPlatform)
    console.log('✅ Effective platform:', effectivePlatform)
    
    if (effectivePlatform === 'vercel') {
      // Vercel platform - scan blob storage
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
        console.log('🔍 Discovering Vercel blob assets...')
        const assets: MediaAsset[] = []
        
        // Get blobs with pagination to avoid memory issues
        console.log(`🔍 Getting blobs (limit: ${limit * 2})...`)
        const { blobs: allBlobs } = await list({ 
          limit: Math.min(1000, limit * 10), // Get more than needed for filtering
          prefix: categoryFilter ? `${VERCEL_FOLDERS[categoryFilter as keyof typeof VERCEL_FOLDERS]}/` : undefined
        })
        
        console.log(`📊 TOTAL BLOBS FOUND: ${allBlobs.length}`)
        console.log('📋 All blob paths:')
        allBlobs.forEach(blob => {
          console.log(`  - ${blob.pathname} (${blob.size} bytes, ${blob.uploadedAt.toISOString()})`)
        })
        
        // Group blobs by their folder structure
        const blobsByFolder: Record<string, typeof allBlobs> = {}
        allBlobs.forEach(blob => {
          const pathParts = blob.pathname.split('/')
          const folder = pathParts.length > 1 ? pathParts[0] : 'root'
          if (!blobsByFolder[folder]) {
            blobsByFolder[folder] = []
          }
          blobsByFolder[folder].push(blob)
        })
        
        console.log('📁 BLOBS GROUPED BY FOLDER:')
        Object.entries(blobsByFolder).forEach(([folder, blobs]) => {
          console.log(`  ${folder}/: ${blobs.length} files`)
        })
        
        // Process each category folder and deduplicate by display filename
        for (const [category, folderPath] of Object.entries(VERCEL_FOLDERS)) {
          try {
            console.log(`🔍 Scanning Vercel folder: ${folderPath}`)
            
            // List blobs with category prefix and reasonable limit
            const { blobs } = await list({ 
              prefix: `${folderPath}/`, 
              limit: Math.min(500, limit * 5) // Dynamic limit based on page size
            })
            
            console.log(`📸 Found ${blobs.length} blobs in ${category} folder (${folderPath})`)
            
            // Group blobs by display filename to handle versioning
            const blobGroups = new Map<string, typeof blobs>()
            
            for (const blob of blobs) {
              try {
                // Extract filename from blob pathname
                const versionedFilename = blob.pathname.split('/').pop() || 'unknown'
                
                // Check if it's a media file
                const ext = versionedFilename.substring(versionedFilename.lastIndexOf('.'))
                if (!MEDIA_EXTENSIONS.includes(ext as any)) {
                  console.log(`  ❌ Skipping non-media file: ${versionedFilename}`)
                  continue
                }
                
                // Extract original filename from versioned filename
                // Pattern: basename_vTIMESTAMP_RANDOM.ext -> basename.ext
                let displayFilename = versionedFilename
                const versionPattern = /_v\d+_[a-z0-9]+(\.[^.]+)$/i
                if (versionPattern.test(versionedFilename)) {
                  // Extract base name and extension
                  const parts = versionedFilename.match(/^(.+)_v\d+_[a-z0-9]+(\.[^.]+)$/i)
                  if (parts) {
                    displayFilename = `${parts[1]}${parts[2]}`
                  }
                }
                
                // Group blobs by their display filename
                const key = `${category}_${displayFilename}`
                if (!blobGroups.has(key)) {
                  blobGroups.set(key, [])
                }
                blobGroups.get(key)!.push(blob)
                
                console.log(`📝 Grouping "${versionedFilename}" -> "${displayFilename}" in group "${key}"`)
                
              } catch (blobError) {
                console.error(`❌ Error processing blob ${blob.pathname}:`, blobError)
              }
            }
            
            // For each group, only keep the latest version (most recent uploadedAt)
            console.log(`📊 Processing ${blobGroups.size} unique files in ${category}:`)
            
            for (const [groupKey, groupBlobs] of blobGroups) {
              if (groupBlobs.length === 0) continue
              
              // Sort by upload date (newest first) and take the first one
              const latestBlob = groupBlobs.sort((a, b) => 
                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
              )[0]
              
              const versionedFilename = latestBlob.pathname.split('/').pop() || 'unknown'
              const ext = versionedFilename.substring(versionedFilename.lastIndexOf('.'))
              
              // Extract display filename
              let displayFilename = versionedFilename
              const versionPattern = /_v\d+_[a-z0-9]+(\.[^.]+)$/i
              if (versionPattern.test(versionedFilename)) {
                const parts = versionedFilename.match(/^(.+)_v\d+_[a-z0-9]+(\.[^.]+)$/i)
                if (parts) {
                  displayFilename = `${parts[1]}${parts[2]}`
                }
              }
              
              // Create asset object for the latest version only
              const asset: MediaAsset = {
                id: `${category}_${versionedFilename}_${latestBlob.uploadedAt.getTime()}`,
                filename: displayFilename,
                url: latestBlob.url,
                type: ext.substring(1).toLowerCase(),
                size: latestBlob.size,
                category,
                uploadedAt: latestBlob.uploadedAt
              }
              
              console.log(`✅ Selected latest version: "${displayFilename}" from ${groupBlobs.length} versions`)
              console.log(`   Latest: ${versionedFilename} (${latestBlob.uploadedAt})`)
              
              if (groupBlobs.length > 1) {
                console.log(`   Older versions not shown:`)
                groupBlobs.slice(1).forEach(blob => {
                  const oldVersionName = blob.pathname.split('/').pop()
                  console.log(`     - ${oldVersionName} (${blob.uploadedAt})`)
                })
              }
              
              assets.push(asset)
            }
          } catch (categoryError) {
            console.error(`❌ Error scanning Vercel folder ${folderPath}:`, categoryError)
          }
        }
        
        // Apply search filter if provided
        let filteredAssets = assets
        if (searchFilter) {
          filteredAssets = assets.filter(asset => 
            asset.filename.toLowerCase().includes(searchFilter)
          )
        }
        
        // Sort by upload date (newest first)
        filteredAssets.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
        
        // Apply pagination
        const totalAssets = filteredAssets.length
        const paginatedAssets = filteredAssets.slice(offset, offset + limit)
        
        console.log(`✅ Vercel blob discovery completed: ${totalAssets} total, ${paginatedAssets.length} on page ${page}`)
        
        // Calculate statistics
        const stats = {
          totalAssets: assets.length,
          totalSize: assets.reduce((acc, asset) => acc + asset.size, 0),
          categories: Object.fromEntries(
            Object.keys(VERCEL_FOLDERS).map(category => [
              category,
              assets.filter(asset => asset.category === category).length
            ])
          ),
          types: assets.reduce((acc, asset) => {
            acc[asset.type] = (acc[asset.type] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        }
        
        return NextResponse.json({
          success: true,
          assets: paginatedAssets,
          pagination: {
            page,
            limit,
            total: totalAssets,
            totalPages: Math.ceil(totalAssets / limit),
            hasNext: page < Math.ceil(totalAssets / limit),
            hasPrev: page > 1
          },
          stats: {
            totalAssets,
            totalSize: filteredAssets.reduce((acc, asset) => acc + asset.size, 0),
            categories: Object.fromEntries(
              Object.keys(VERCEL_FOLDERS).map(category => [
                category,
                filteredAssets.filter(asset => asset.category === category).length
              ])
            ),
            types: filteredAssets.reduce((acc, asset) => {
              acc[asset.type] = (acc[asset.type] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          },
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

    // Server platform - scan local media directories
    console.log('🖥️  Server platform detected - scanning local media directories')
    
    const assets: MediaAsset[] = []
    const baseMediaPath = join(process.cwd(), 'media')
    
    console.log('📁 Base media path:', baseMediaPath)
    console.log('📁 Base media path exists:', existsSync(baseMediaPath))
    
    // Check if media directory exists
    if (!existsSync(baseMediaPath)) {
      console.log('📁 Media directory does not exist at:', baseMediaPath)
      return NextResponse.json({
        success: true,
        assets: [],
        platform: effectivePlatform,
        stats: {
          totalAssets: 0,
          totalSize: 0,
          categories: {},
          types: {}
        },
        message: 'Media directory not found. Upload files to create the directory structure.',
        baseMediaPath,
        timestamp: new Date().toISOString()
      })
    }

    // Debug: List all contents of media directory
    try {
      const mediaContents = await readdir(baseMediaPath)
      console.log('📋 Contents of media directory:', mediaContents)
    } catch (error) {
      console.error('❌ Error reading media directory:', error)
    }

    // Scan each category directory
    for (const [category, relativePath] of Object.entries(MEDIA_DIRECTORIES)) {
      const categoryPath = join(process.cwd(), relativePath)
      
      console.log(`\n🔍 === SCANNING CATEGORY: ${category} ===`)
      console.log(`📁 Expected path: ${categoryPath}`)
      console.log(`📁 Directory exists: ${existsSync(categoryPath)}`)
      
      try {
        if (!existsSync(categoryPath)) {
          console.log(`❌ Category directory ${category} does not exist, skipping...`)
          continue
        }

        console.log(`✅ Scanning ${category} directory: ${categoryPath}`)
        
        const files = await readdir(categoryPath)
        console.log(`📋 ALL files found in ${category}:`, files)
        
        const mediaFiles = files.filter(file => {
          const ext = file.substring(file.lastIndexOf('.'))
          const isMedia = MEDIA_EXTENSIONS.includes(ext as any)
          console.log(`  - ${file} (ext: ${ext}) -> ${isMedia ? '✅ MEDIA' : '❌ NOT MEDIA'}`)
          return isMedia
        })

        console.log(`📸 FINAL: Found ${mediaFiles.length} valid media files in ${category}:`, mediaFiles)
        
        if (mediaFiles.length === 0 && files.length > 0) {
          console.log(`⚠️  WARNING: ${category} has ${files.length} files but 0 media files - check file extensions!`)
          console.log(`📋 Non-media files in ${category}:`, files.filter(file => {
            const ext = file.substring(file.lastIndexOf('.'))
            return !MEDIA_EXTENSIONS.includes(ext as any)
          }))
        }

        // Process each media file
        for (const filename of mediaFiles) {
          try {
            const filePath = join(categoryPath, filename)
            const fileStats = await stat(filePath)
            
            // Generate asset URL
            const assetUrl = `/${relativePath}/${filename}`.replace(/\\/g, '/')
            
            // Create asset object
            const asset: MediaAsset = {
              id: `${category}_${filename}_${fileStats.mtimeMs}`,
              filename,
              url: assetUrl,
              type: filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(),
              size: fileStats.size,
              category,
              uploadedAt: fileStats.mtime
            }
            
            assets.push(asset)
          } catch (fileError) {
            console.error(`❌ Error processing file ${filename} in ${category}:`, fileError)
          }
        }
      } catch (dirError) {
        console.error(`❌ Error scanning directory ${category}:`, dirError)
      }
    }

    // Apply filters
    let filteredAssets = assets
    if (categoryFilter && MEDIA_DIRECTORIES[categoryFilter as keyof typeof MEDIA_DIRECTORIES]) {
      filteredAssets = assets.filter(asset => asset.category === categoryFilter)
    }
    if (searchFilter) {
      filteredAssets = filteredAssets.filter(asset => 
        asset.filename.toLowerCase().includes(searchFilter)
      )
    }
    
    // Sort by upload date (newest first)
    filteredAssets.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    
    // Apply pagination
    const totalAssets = filteredAssets.length
    const paginatedAssets = filteredAssets.slice(offset, offset + limit)

    console.log(`✅ Asset discovery completed: ${totalAssets} total, ${paginatedAssets.length} on page ${page}`)

    // Calculate statistics
    const stats = {
      totalAssets: assets.length,
      totalSize: assets.reduce((acc, asset) => acc + asset.size, 0),
      categories: Object.fromEntries(
        Object.keys(MEDIA_DIRECTORIES).map(category => [
          category,
          assets.filter(asset => asset.category === category).length
        ])
      ),
      types: assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json({
      success: true,
      assets: paginatedAssets,
      pagination: {
        page,
        limit,
        total: totalAssets,
        totalPages: Math.ceil(totalAssets / limit),
        hasNext: page < Math.ceil(totalAssets / limit),
        hasPrev: page > 1
      },
      stats: {
        totalAssets,
        totalSize: filteredAssets.reduce((acc, asset) => acc + asset.size, 0),
        categories: Object.fromEntries(
          Object.keys(MEDIA_DIRECTORIES).map(category => [
            category,
            filteredAssets.filter(asset => asset.category === category).length
          ])
        ),
        types: filteredAssets.reduce((acc, asset) => {
          acc[asset.type] = (acc[asset.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      platform: effectivePlatform,
      filters: { category: categoryFilter, search: searchFilter },
      timestamp: new Date().toISOString()
    })

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