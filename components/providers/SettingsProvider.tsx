'use client'

import { useEffect, ReactNode, useRef, useState } from 'react'
import useSettingStore from '@/hooks/use-setting-store'

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { forceRefresh, isLoaded, setLoaded } = useSettingStore()
  const loadingRef = useRef(false)
  const mountedRef = useRef(false)

  // Ensure this only runs on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Only run on client side after mount
    if (!isMounted) return
    
    // Prevent multiple instances
    if (mountedRef.current) return
    mountedRef.current = true

    async function loadSettings() {
      // Prevent concurrent requests
      if (loadingRef.current) return
      loadingRef.current = true
      
      try {
        // Always fetch fresh settings from the server
        const response = await fetch('/api/site-settings', {
          cache: 'no-store', // Force fresh data
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Add a brief delay to ensure loader is visible
            await new Promise(resolve => setTimeout(resolve, 500))
            // Force refresh to ensure fresh data from database
            forceRefresh(data.settings)
          }
        } else {
          console.error('Failed to fetch settings, status:', response.status)
          setLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        // Mark as loaded even if failed to prevent infinite loading
        setLoaded(true)
      } finally {
        loadingRef.current = false
      }
    }

    // Ensure we start with loading state
    setLoaded(false)
    
    // Load settings on component mount
    loadSettings()

    // Set up periodic refresh to keep settings in sync
    const interval = setInterval(async () => {
      if (!loadingRef.current) {
        await loadSettings()
      }
    }, 30000) // Refresh every 30 seconds

    return () => {
      clearInterval(interval)
      mountedRef.current = false
    }
  }, [isMounted, forceRefresh, setLoaded])

  // Always render children to prevent SSR mismatch
  return <>{children}</>
}