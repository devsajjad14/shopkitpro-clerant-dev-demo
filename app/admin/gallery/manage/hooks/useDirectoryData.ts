'use client'

import { useState, useEffect, useCallback } from 'react'
import { directoryService } from '../services/directory-service'
import type { DirectoryInfo } from '../services/directory-service'
import useSettingStore from '@/hooks/use-setting-store'

export function useDirectoryData() {
  const [directories, setDirectories] = useState<DirectoryInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastPlatform, setLastPlatform] = useState<string | null>(null)
  const [hookId] = useState(() => Math.random().toString(36).substr(2, 9))
  const platform = useSettingStore((state) => state.getPlatform())
  const isLoaded = useSettingStore((state) => state.isLoaded)

  const loadDirectories = useCallback(async (forceRefresh = false, overridePlatform?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const effectivePlatform = overridePlatform || platform
      
      // Load with current platform - settings will update via separate effect if needed
      
      // If force refresh, clear cache first
      if (forceRefresh) {
        directoryService.clearCache()
      }
      
      const directoriesData = await directoryService.getAllDirectories(effectivePlatform)
      setDirectories(directoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory data')
    } finally {
      setLoading(false)
    }
  }, [platform, isLoaded])

  const refreshDirectory = useCallback(async (directoryId: string) => {
    try {
      const updatedDirectory = await directoryService.refreshDirectory(directoryId, platform)
      if (updatedDirectory) {
        setDirectories(prev => 
          prev.map(dir => dir.id === directoryId ? updatedDirectory : dir)
        )
      }
    } catch (err) {
      console.error(`Failed to refresh directory ${directoryId}:`, err)
    }
  }, [platform])


  const toggleDirectory = useCallback((directoryId: string) => {
    setDirectories(prev => 
      prev.map(dir => 
        dir.id === directoryId 
          ? { ...dir, isExpanded: !dir.isExpanded }
          : dir
      )
    )
  }, [])

  // Load directories immediately, don't wait for settings
  useEffect(() => {
    // Check if platform changed
    if (lastPlatform && lastPlatform !== platform) {
      console.log(`📡 [${hookId}] Platform changed from`, lastPlatform, 'to:', platform, '- clearing state and reloading')
      
      // Force clear all state first
      setDirectories([])
      setError(null)
      setLoading(true)
      
      // Clear all caches
      directoryService.clearCache()
      
      // Force reload with new platform - explicitly pass the new platform
      setTimeout(() => {
        loadDirectories(true, platform)
      }, 100)
    } else if (!lastPlatform) {
      // Initial load - don't wait for isLoaded
      console.log(`🚀 [${hookId}] Initial load with platform:`, platform)
      loadDirectories(true, platform)
    }
    
    // Update last platform
    setLastPlatform(platform)
  }, [platform, lastPlatform, loadDirectories])

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