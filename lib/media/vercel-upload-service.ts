// Dynamic imports for Vercel operations
const importVercelBlob = () => import('@vercel/blob')
const importFs = () => import('fs')
const importPath = () => import('path')

// Content type detection for all file types
export function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.avif': 'image/avif', '.heic': 'image/heic', '.heif': 'image/heif',
    '.bmp': 'image/bmp', '.tiff': 'image/tiff', '.tif': 'image/tiff',
    '.ico': 'image/x-icon', '.apng': 'image/apng',
    
    // Documents
    '.pdf': 'application/pdf', '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text
    '.txt': 'text/plain', '.html': 'text/html', '.css': 'text/css',
    '.js': 'application/javascript', '.json': 'application/json',
    '.xml': 'application/xml', '.csv': 'text/csv',
    
    // Audio
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
    
    // Video
    '.mp4': 'video/mp4', '.avi': 'video/x-msvideo', '.mov': 'video/quicktime',
    '.webm': 'video/webm', '.mkv': 'video/x-matroska',
    
    // Archives
    '.zip': 'application/zip', '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed', '.tar': 'application/x-tar',
    '.gz': 'application/gzip'
  }
  
  return contentTypes[ext.toLowerCase()] || 'application/octet-stream'
}

export async function uploadFileToVercel(
  fileBuffer: Buffer,
  filename: string,
  folder: string
): Promise<{ url: string, pathname: string }> {
  const { put } = await importVercelBlob()
  const path = await importPath()
  
  const ext = path.extname(filename)
  const baseName = path.basename(filename, ext)
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const versionedFilename = `${baseName}_v${timestamp}_${randomId}${ext}`
  const blobPath = `${folder}/${versionedFilename}`
  
  const contentType = getContentType(ext)
  
  try {
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType
    })
    
    return { 
      url: blob.url, 
      pathname: blob.pathname 
    }
  } catch (error) {
    console.error('Error uploading to Vercel blob:', error)
    throw new Error(`Failed to upload ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function checkExistingFiles(folder: string): Promise<any[]> {
  const { list } = await importVercelBlob()
  
  try {
    const { blobs } = await list({ prefix: `${folder}/` })
    return blobs
  } catch (error) {
    console.error('Error listing Vercel blobs:', error)
    return []
  }
}

export async function processLocalMediaFiles(
  mediaPath: string,
  folder: string
): Promise<{
  uploaded: Array<{ filename: string, url: string, size: number }>,
  skipped: Array<{ filename: string, reason: string }>,
  errors: Array<{ filename: string, error: string }>
}> {
  const fs = await importFs()
  const path = await importPath()
  
  const results = {
    uploaded: [] as Array<{ filename: string, url: string, size: number }>,
    skipped: [] as Array<{ filename: string, reason: string }>,
    errors: [] as Array<{ filename: string, error: string }>
  }
  
  try {
    if (!fs.existsSync(mediaPath)) {
      throw new Error(`Media path does not exist: ${mediaPath}`)
    }
    
    const files = fs.readdirSync(mediaPath)
    const existingBlobs = await checkExistingFiles(folder)
    const existingFileNames = new Set(existingBlobs.map(blob => path.basename(blob.pathname)))
    
    for (const filename of files) {
      try {
        if (filename.startsWith('.') || filename === 'Thumbs.db') {
          results.skipped.push({ filename, reason: 'System file' })
          continue
        }
        
        if (existingFileNames.has(filename)) {
          results.skipped.push({ filename, reason: 'Already exists in Vercel' })
          continue
        }
        
        const filePath = path.join(mediaPath, filename)
        const stats = fs.statSync(filePath)
        
        if (!stats.isFile()) {
          results.skipped.push({ filename, reason: 'Not a file' })
          continue
        }
        
        const fileBuffer = fs.readFileSync(filePath)
        const uploadResult = await uploadFileToVercel(fileBuffer, filename, folder)
        
        results.uploaded.push({
          filename,
          url: uploadResult.url,
          size: stats.size
        })
        
      } catch (error) {
        results.errors.push({
          filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
  } catch (error) {
    throw new Error(`Failed to process media files: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return results
}