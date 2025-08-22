'use client'

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

class SimpleDirectoryService {
  
  async getAllDirectories(): Promise<DirectoryInfo[]> {
    try {
      const response = await fetch('/api/media-files')
      if (!response.ok) {
        return []
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching directories:', error)
      return []
    }
  }

  async getDirectoryFiles(directoryId: string): Promise<FileInfo[]> {
    try {
      const response = await fetch(`/api/media-files/${directoryId}`)
      if (!response.ok) {
        return []
      }
      const files = await response.json()
      return files.map((file: any) => ({
        ...file,
        lastModified: new Date(file.lastModified)
      }))
    } catch (error) {
      console.error('Error fetching files:', error)
      return []
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    // Not implemented for now
    return false
  }
}

export const simpleDirectoryService = new SimpleDirectoryService()