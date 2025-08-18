import { readdir, stat } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'

interface MediaAsset {
  id: string
  filename: string
  url: string
  type: string
  size: number
  category: string
  uploadedAt: Date
}

const MEDIA_DIRECTORIES = {
  'products': 'media/products',
  'main-banners': 'media/main-banners',
  'mini-banners': 'media/mini-banners',
  'brands': 'media/brands',
  'site': 'media/site',
  'users': 'media/users',
  'pages': 'media/pages',
} as const

export async function scanServerMediaDirectories(
  categoryFilter?: string,
  searchFilter?: string
): Promise<MediaAsset[]> {
  const assets: MediaAsset[] = []
  const baseMediaPath = join(process.cwd(), 'media')
  
  console.log('📁 Base media path:', baseMediaPath)
  console.log('📁 Base media path exists:', existsSync(baseMediaPath))
  
  if (!existsSync(baseMediaPath)) {
    console.log('📁 Media directory does not exist at:', baseMediaPath)
    return []
  }

  try {
    const mediaContents = await readdir(baseMediaPath)
    console.log('📋 Contents of media directory:', mediaContents)
  } catch (error) {
    console.error('❌ Error reading media directory:', error)
  }

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
        if (file.startsWith('.') || file.startsWith('~') || file === 'Thumbs.db' || file === 'desktop.ini') {
          console.log(`  - ${file} -> ❌ SYSTEM/HIDDEN FILE`)
          return false
        }
        
        const ext = extname(file)
        console.log(`  - ${file} (ext: ${ext}) -> ✅ INCLUDED`)
        return true
      })

      console.log(`📸 FINAL: Found ${mediaFiles.length} files in ${category}:`, mediaFiles)
      
      if (mediaFiles.length === 0 && files.length > 0) {
        console.log(`⚠️  WARNING: ${category} has ${files.length} files but 0 are being shown - check system/hidden file filters!`)
      }

      for (const filename of mediaFiles) {
        try {
          const filePath = join(categoryPath, filename)
          const fileStats = await stat(filePath)
          
          const assetUrl = `/${relativePath}/${filename}`.replace(/\\/g, '/')
          
          const asset: MediaAsset = {
            id: `${category}_${filename}_${fileStats.mtimeMs}`,
            filename,
            url: assetUrl,
            type: extname(filename).substring(1).toLowerCase() || 'unknown',
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

  return assets
}