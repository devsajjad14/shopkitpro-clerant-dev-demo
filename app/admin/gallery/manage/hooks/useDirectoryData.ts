'use client'

import { useState, useEffect, useCallback } from 'react'
import { directoryService } from '../services/directory-service'
import type { DirectoryInfo, DirectoryStats } from '../services/directory-service'

export function useDirectoryData() {
  const [directories, setDirectories] = useState<DirectoryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDirectories = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // If force refresh, clear cache first
      if (forceRefresh) {
        directoryService.clearCache()
      }
      
      const directoriesData = await directoryService.getAllDirectories()
      setDirectories(directoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshDirectory = useCallback(async (directoryId: string) => {
    try {
      const updatedDirectory = await directoryService.refreshDirectory(directoryId)
      if (updatedDirectory) {
        setDirectories(prev => 
          prev.map(dir => dir.id === directoryId ? updatedDirectory : dir)
        )
      }
    } catch (err) {
      console.error(`Failed to refresh directory ${directoryId}:`, err)
    }
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
    // Always start with fresh data by clearing cache on mount
    loadDirectories(true)
  }, [loadDirectories])

  return {
    directories,
    loading,
    error,
    refreshDirectory,
    toggleDirectory,
    reload: loadDirectories,
    forceRefresh: () => loadDirectories(true)
  }
}