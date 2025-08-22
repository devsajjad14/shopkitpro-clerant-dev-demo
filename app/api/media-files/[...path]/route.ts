import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    
    if (!path || path.length === 0) {
      // List all directories
      const mediaPath = join(process.cwd(), 'client', 'app', 'admin', 'media')
      
      if (!existsSync(mediaPath)) {
        return NextResponse.json([])
      }
      
      const dirs = await readdir(mediaPath, { withFileTypes: true })
      const directories = []
      
      for (const dir of dirs) {
        if (dir.isDirectory()) {
          const dirPath = join(mediaPath, dir.name)
          const files = await readdir(dirPath)
          const fileCount = files.filter(file => {
            const ext = file.split('.').pop()?.toLowerCase()
            return ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif'].includes(ext)
          }).length
          
          directories.push({
            id: dir.name,
            name: dir.name,
            path: dir.name,
            description: `${dir.name} directory`,
            icon: '📁',
            fileCount,
            totalSize: 0,
            lastModified: new Date(),
            isExpanded: false
          })
        }
      }
      
      return NextResponse.json(directories)
    }
    
    // List files in specific directory
    const directoryName = path[0]
    const mediaPath = join(process.cwd(), 'client', 'app', 'admin', 'media', directoryName)
    
    if (!existsSync(mediaPath)) {
      return NextResponse.json([])
    }
    
    const files = await readdir(mediaPath)
    const fileList = []
    
    for (const fileName of files) {
      const filePath = join(mediaPath, fileName)
      const stats = await stat(filePath)
      
      if (stats.isFile()) {
        const extension = fileName.split('.').pop()?.toLowerCase() || ''
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif'].includes(extension)
        
        fileList.push({
          name: fileName,
          size: stats.size,
          type: extension,
          lastModified: stats.mtime.toISOString(),
          url: `/api/media/${directoryName}/${fileName}`,
          isImage
        })
      }
    }
    
    return NextResponse.json(fileList)
    
  } catch (error) {
    console.error('Media files API error:', error)
    return NextResponse.json([])
  }
}