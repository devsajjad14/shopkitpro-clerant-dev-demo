'use client'

import { UPLOAD_FOLDERS } from '../config'
import type { UploadFolder } from '../types'
import { cacheManager } from './cache-manager'

export interface DirectoryInfo {
  id: string
  name: string
  path: string
  description: string
  icon: string
  fileCount: number
  totalSize: number
  lastModified?: Date
  files?: FileInfo[]
  isExpanded?: boolean
}

export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: Date
  url?: string
  isImage?: boolean
}


class DirectoryService {
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes

  async getDirectoryInfo(directoryId: string, platform?: string): Promise<DirectoryInfo | null> {
    try {
      // Always fetch fresh data - no caching
      const timestamp = Date.now()
      const platformParam = platform ? `&platform=${platform}` : ''
      const url = `/api/media-manager/directory/${directoryId}?t=${timestamp}${platformParam}`
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        console.warn(`Failed to fetch directory info for ${directoryId}`)
        return this.getFallbackDirectoryInfo(directoryId)
      }

      const data = await response.json()
      
      const dirInfo: DirectoryInfo = {
        ...data,
        lastModified: new Date()
      }
      
      return dirInfo
    } catch (error) {
      console.error(`Error fetching directory info for ${directoryId}:`, error)
      return this.getFallbackDirectoryInfo(directoryId)
    }
  }

  async getAllDirectories(platform?: string): Promise<DirectoryInfo[]> {
    const directories = await Promise.allSettled(
      UPLOAD_FOLDERS.map(folder => this.getDirectoryInfo(folder.id, platform))
    )

    return directories
      .filter((result): result is PromiseFulfilledResult<DirectoryInfo> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
  }


  async getDirectoryFiles(directoryId: string, platform?: string): Promise<FileInfo[]> {
    try {
      // Always fetch fresh data - no caching
      const timestamp = Date.now()
      const platformParam = platform ? `&platform=${platform}` : ''
      const response = await fetch(`/api/media-manager/files/${directoryId}?t=${timestamp}${platformParam}`)
      if (!response.ok) {
        return []
      }

      const files = await response.json()
      const processedFiles = files.map((file: any) => ({
        ...file,
        lastModified: new Date(file.lastModified),
        isImage: this.isImageFile(file.name)
      }))
      
      return processedFiles
    } catch (error) {
      console.error(`Error fetching files for ${directoryId}:`, error)
      return []
    }
  }

  private getFallbackDirectoryInfo(directoryId: string): DirectoryInfo {
    console.log('🔄 Using fallback data for directory:', directoryId)
    
    const folder = UPLOAD_FOLDERS.find(f => f.id === directoryId)
    if (!folder) {
      throw new Error(`Unknown directory: ${directoryId}`)
    }

    return {
      id: folder.id,
      name: folder.name,
      path: folder.path,
      description: folder.description,
      icon: folder.icon,
      fileCount: 0,
      totalSize: 0,
      lastModified: new Date(),
      files: []
    }
  }


  private isImageFile(filename: string): boolean {
    const imageExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 
      'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif'
    ]
    const extension = filename.split('.').pop()?.toLowerCase() || ''
    return imageExtensions.includes(extension)
  }

  clearCache(): void {
    cacheManager.clear()
  }

  // Force refresh all directory data by clearing cache and reloading
  async forceRefreshAll(platform?: string): Promise<DirectoryInfo[]> {
    console.log('🔄 Force refreshing all directory data...')
    
    // Clear all caches completely
    cacheManager.clear()
    
    // Force reload from API
    return this.getAllDirectories(platform)
  }

  refreshDirectory(directoryId: string, platform?: string): Promise<DirectoryInfo | null> {
    // Clear specific directory caches
    cacheManager.delete(`dir_${directoryId}`)
    cacheManager.delete(`files_${directoryId}`)
    
    // Also clear stats cache since it might be affected
    cacheManager.delete('directory_stats')
    
    console.log(`🔄 Refreshed cache for directory: ${directoryId}`)
    return this.getDirectoryInfo(directoryId, platform)
  }

  getCacheStats() {
    return cacheManager.getStats()
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const response = await fetch('/api/media-manager/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl })
      })

      const result = await response.json()
      
      if (result.success) {
        // Clear all relevant caches after successful deletion
        this.clearCache() // Clear directory and file caches
        
        // Also clear any pattern-based caches if needed
        cacheManager.clearByPattern('^(dir_|files_)')
        
        console.log('✅ File deleted and cache cleared:', fileUrl)
        return true
      } else {
        console.error('File deletion failed:', result.error)
        return false
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }
}

export const directoryService = new DirectoryService()