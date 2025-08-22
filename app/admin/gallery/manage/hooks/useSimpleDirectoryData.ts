'use client'

import { useState, useEffect, useCallback } from 'react'
import { simpleDirectoryService } from '../services/simple-directory-service'
import type { DirectoryInfo } from '../services/simple-directory-service'

export function useSimpleDirectoryData() {
  const [directories, setDirectories] = useState<DirectoryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDirectories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const directoriesData = await simpleDirectoryService.getAllDirectories()
      setDirectories(directoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshDirectory = useCallback(async (directoryId: string) => {
    console.log('Refreshing directory:', directoryId)
  }, [])

  const toggleDirectory = useCallback((directoryId: string) => {
    setDirectories(prev => 
      prev.map(dir => 
        dir.id === directoryId 
          ? { ...dir, isExpanded: !dir.isExpanded }
          : dir
      )
    )
  }, [])

  useEffect(() => {
    loadDirectories()
  }, [loadDirectories])

  return {
    directories,
    loading,
    error,
    toggleDirectory,
    refreshDirectory,
    reload: loadDirectories,
    forceRefresh: loadDirectories
  }
}