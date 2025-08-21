'use client'

import { useState, useEffect, useCallback } from 'react'
import { directoryService } from '../services/directory-service'
import type { DirectoryInfo, DirectoryStats } from '../services/directory-service'

export function useDirectoryData() {
  const [directories, setDirectories] = useState<DirectoryInfo[]>([])
  const [stats, setStats] = useState<DirectoryStats | null>(null)
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
      
      const [directoriesData, statsData] = await Promise.all([
        directoryService.getAllDirectories(),
        directoryService.getDirectoryStats()
      ])
      
      setDirectories(directoriesData)
      setStats(statsData)
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

  const refreshStats = useCallback(async () => {
    try {
      const statsData = await directoryService.getDirectoryStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to refresh stats:', err)
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
    stats,
    loading,
    error,
    refreshDirectory,
    refreshStats,
    toggleDirectory,
    reload: loadDirectories,
    forceRefresh: () => loadDirectories(true)
  }
}