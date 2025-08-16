'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface SetupStatus {
  isSetup: boolean
  hasSettings: boolean
  hasAdminUsers: boolean
}

interface SetupContextType {
  setupStatus: SetupStatus | null
  isLoading: boolean
  refreshSetupStatus: () => Promise<void>
}

const SetupContext = createContext<SetupContextType | undefined>(undefined)

export function SetupStatusProvider({ children }: { children: React.ReactNode }) {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)

  const refreshSetupStatus = async (forceRefresh = false) => {
    try {
      // If force refresh, clear cache first
      if (forceRefresh) {
        sessionStorage.removeItem('setupStatus')
      } else {
        // Check session storage first
        const cached = sessionStorage.getItem('setupStatus')
        if (cached) {
          const parsed = JSON.parse(cached)
          setSetupStatus(parsed)
          return
        }
      }

      // Fetch from API
      const response = await fetch('/api/setup/status')
      const result = await response.json()

      if (result.success) {
        const status = result.data
        setSetupStatus(status)
        
        // Cache in session storage
        sessionStorage.setItem('setupStatus', JSON.stringify(status))
      }
    } catch (error) {
      console.error('Failed to refresh setup status:', error)
    }
  }

  useEffect(() => {
    refreshSetupStatus()
  }, [])

  return (
    <SetupContext.Provider value={{ setupStatus, isLoading: false, refreshSetupStatus }}>
      {children}
    </SetupContext.Provider>
  )
}

export function useSetupStatus() {
  const context = useContext(SetupContext)
  if (context === undefined) {
    throw new Error('useSetupStatus must be used within a SetupStatusProvider')
  }
  return context
}

// Clear setup status cache when setup is completed
export function clearSetupCache() {
  sessionStorage.removeItem('setupStatus')
} 