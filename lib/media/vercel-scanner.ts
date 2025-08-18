import { list } from '@vercel/blob'
import { extname } from 'path'

interface MediaAsset {
  id: string
  filename: string
  url: string
  type: string
  size: number
  category: string
  uploadedAt: Date
}

const VERCEL_FOLDERS = {
  'products': 'products',
  'main-banners': 'main-banners',
  'mini-banners': 'mini-banners',
  'brands': 'brands',
  'site': 'site',
  'users': 'users',
  'pages': 'pages',
} as const

export async function scanVercelBlobStorage(categoryFilter?: string): Promise<MediaAsset[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('❌ BLOB_READ_WRITE_TOKEN not configured')
    return []
  }

  try {
    console.log('🔍 Discovering Vercel blob assets...')
    const assets: MediaAsset[] = []
    
    console.log(`🔍 Getting ALL blobs without limits...`)
    const { blobs: allBlobs } = await list({ 
      prefix: categoryFilter ? `${VERCEL_FOLDERS[categoryFilter as keyof typeof VERCEL_FOLDERS]}/` : undefined
    })
    
    console.log(`📊 TOTAL BLOBS FOUND: ${allBlobs.length}`)

    for (const [category, folderPath] of Object.entries(VERCEL_FOLDERS)) {
      try {
        console.log(`🔍 Scanning Vercel folder: ${folderPath}`)
        
        const { blobs } = await list({ 
          prefix: `${folderPath}/`
        })
        
        console.log(`📸 Found ${blobs.length} blobs in ${category} folder (${folderPath})`)
        
        const blobGroups = new Map<string, typeof blobs>()
        
        for (const blob of blobs) {
          try {
            const versionedFilename = blob.pathname.split('/').pop() || 'unknown'
            
            if (versionedFilename.startsWith('.') || versionedFilename.startsWith('~') || 
                versionedFilename === 'Thumbs.db' || versionedFilename === 'desktop.ini') {
              console.log(`  ❌ Skipping system/hidden file: ${versionedFilename}`)
              continue
            }
            
            let displayFilename = versionedFilename
            const versionPattern = /_v\d+_[a-z0-9]+(\.[^.]+)$/i
            if (versionPattern.test(versionedFilename)) {
              const parts = versionedFilename.match(/^(.+)_v\d+_[a-z0-9]+(\.[^.]+)$/i)
              if (parts) {
                displayFilename = `${parts[1]}${parts[2]}`
              }
            }
            
            const key = `${category}_${displayFilename}`
            if (!blobGroups.has(key)) {
              blobGroups.set(key, [])
            }
            blobGroups.get(key)!.push(blob)
            
          } catch (blobError) {
            console.error(`❌ Error processing blob ${blob.pathname}:`, blobError)
          }
        }
        
        console.log(`📊 Processing ${blobGroups.size} unique files in ${category}:`)
        
        for (const [groupKey, groupBlobs] of blobGroups) {
          if (groupBlobs.length === 0) continue
          
          const latestBlob = groupBlobs.sort((a, b) => 
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          )[0]
          
          const versionedFilename = latestBlob.pathname.split('/').pop() || 'unknown'
          const ext = versionedFilename.substring(versionedFilename.lastIndexOf('.'))
          
          let displayFilename = versionedFilename
          const versionPattern = /_v\d+_[a-z0-9]+(\.[^.]+)$/i
          if (versionPattern.test(versionedFilename)) {
            const parts = versionedFilename.match(/^(.+)_v\d+_[a-z0-9]+(\.[^.]+)$/i)
            if (parts) {
              displayFilename = `${parts[1]}${parts[2]}`
            }
          }
          
          const asset: MediaAsset = {
            id: `${category}_${versionedFilename}_${latestBlob.uploadedAt.getTime()}`,
            filename: displayFilename,
            url: latestBlob.url,
            type: ext.substring(1).toLowerCase() || 'unknown',
            size: latestBlob.size,
            category,
            uploadedAt: latestBlob.uploadedAt
          }
          
          console.log(`✅ Selected latest version: "${displayFilename}" from ${groupBlobs.length} versions`)
          assets.push(asset)
        }
      } catch (categoryError) {
        console.error(`❌ Error scanning Vercel folder ${folderPath}:`, categoryError)
      }
    }

    return assets
  } catch (error) {
    console.error('❌ Vercel blob discovery error:', error)
    throw error
  }
}