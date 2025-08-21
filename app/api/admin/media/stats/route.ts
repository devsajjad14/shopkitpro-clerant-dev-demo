import { NextResponse } from 'next/server'
import { UPLOAD_FOLDERS } from '@/app/admin/media/upload-media/config'
import { listPlatformFiles, type PlatformFileInfo } from '@/lib/services/platform-upload-service'

export async function GET() {
  try {
    const stats = {
      totalFiles: 0,
      totalFolders: UPLOAD_FOLDERS.length,
      totalSize: 0,
      filesByType: {} as Record<string, number>,
      largestFiles: [] as PlatformFileInfo[],
      recentFiles: [] as PlatformFileInfo[]
    }

    const allFiles: PlatformFileInfo[] = []

    // Use platform-aware file listing for all folders
    for (const folder of UPLOAD_FOLDERS) {
      try {
        const files = await listPlatformFiles(folder.path)
        
        for (const file of files) {
          stats.totalFiles++
          stats.totalSize += file.size
          stats.filesByType[file.type] = (stats.filesByType[file.type] || 0) + 1
          
          allFiles.push(file)
        }
      } catch (err) {
        console.error(`Error getting files for folder ${folder.path}:`, err)
      }
    }

    // Get largest files (top 10)
    stats.largestFiles = allFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)

    // Get recent files (last 20)
    stats.recentFiles = allFiles
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 20)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting directory stats:', error)
    return NextResponse.json(
      { error: 'Failed to get directory statistics' },
      { status: 500 }
    )
  }
}