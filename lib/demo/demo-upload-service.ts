// Dynamic imports for demo upload operations
const importVercelBlob = () => import('@vercel/blob')
const importFs = () => import('fs/promises')
const importPath = () => import('path')
const importFsSync = () => import('fs')

const SUPPORTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.avif',
  '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.pdf',
  '.zip', '.rar', '.doc', '.docx', '.xls', '.xlsx'
]

export function getCategoryForFolder(folderName: string): string {
  return folderName || 'general'
}

export function getServerMediaPath(category: string): string {
  const path = require('path')
  return path.join(process.cwd(), 'media', category)
}

export function getVercelBlobPath(category: string, fileName: string): string {
  return `media/${category}/${fileName}`
}

export async function getDirectoryContents(dirPath: string): Promise<{ files: string[], folders: string[] }> {
  const fs = await importFs()
  const path = await importPath()
  
  const files: string[] = []
  const folders: string[] = []
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const item of items) {
      if (item.isDirectory()) {
        folders.push(item.name)
        const subPath = path.join(dirPath, item.name)
        const subContents = await getDirectoryContents(subPath)
        
        for (const file of subContents.files) {
          files.push(path.join(item.name, file))
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase()
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          files.push(item.name)
        }
      }
    }
    
    return { files, folders }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return { files: [], folders: [] }
  }
}

export async function uploadToVercel(filePath: string, category: string, fileName: string) {
  const { put } = await importVercelBlob()
  const fs = await importFs()
  
  try {
    const fileBuffer = await fs.readFile(filePath)
    const blobPath = getVercelBlobPath(category, fileName)
    
    const result = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType: 'application/octet-stream'
    })
    
    return result
  } catch (error) {
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function processMediaUpload(category?: string) {
  const path = await importPath()
  const { existsSync } = await importFsSync()
  
  const targetCategory = category || 'general'
  const mediaPath = getServerMediaPath(targetCategory)
  
  if (!existsSync(mediaPath)) {
    throw new Error(`Media path does not exist: ${mediaPath}`)
  }
  
  const contents = await getDirectoryContents(mediaPath)
  const results = {
    uploaded: [] as any[],
    skipped: [] as any[],
    errors: [] as any[]
  }
  
  for (const file of contents.files) {
    try {
      const fullPath = path.join(mediaPath, file)
      const result = await uploadToVercel(fullPath, targetCategory, file)
      
      results.uploaded.push({
        file,
        url: result.url,
        size: result.size
      })
    } catch (error) {
      results.errors.push({
        file,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return results
}