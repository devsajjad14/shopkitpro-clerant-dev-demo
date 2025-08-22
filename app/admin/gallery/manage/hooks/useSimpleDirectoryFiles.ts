'use client'

import { useState, useEffect, useCallback } from 'react'
import { simpleDirectoryService } from '../services/simple-directory-service'
import type { FileInfo } from '../services/simple-directory-service'

export function useSimpleDirectoryFiles(directoryId: string | null) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFiles = useCallback(async (dirId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading files for directory:', dirId)
      const filesData = await simpleDirectoryService.getDirectoryFiles(dirId)
      console.log('Loaded', filesData.length, 'files')
      setFiles(filesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (directoryId) {
      loadFiles(directoryId)
    } else {
      setFiles([])
      setError(null)
    }
  }, [directoryId, loadFiles])

  const refreshFiles = useCallback(() => {
    if (directoryId) {
      loadFiles(directoryId)
    }
  }, [directoryId, loadFiles])

  return {
    files,
    loading,
    error,
    refreshFiles
  }
}